import "server-only";

import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import {
  getOrderById,
  toOrderReturn,
} from "@/lib/orders-data";
import type { OrderReturn, OrderItem } from "@/types";

// Stage #5 returns. Refunds are recorded, never auto-initiated this stage:
// an approved return becomes "refund_pending_manual" (with refundCents) and is
// only moved to "refunded" by a manual human step. Every mutation is scoped
// to the order owner (the same gate used by the payment callback).

export const RETURN_WINDOW_DAYS = 30;

export type OrderReturnEntry = {
  productId: string;
  quantity: number;
};

/**
 * The date the 30-day return window starts from: delivery date when the order
 * was delivered, otherwise the confirmation (paid) date. Orders that are only
 * placed/reserved are already ineligible by eligibility rules below.
 */
function returnWindowAnchor(order: {
  deliveredAtISO?: string;
  paidAtISO?: string;
  placedAtISO: string;
}): Date {
  const anchor = order.deliveredAtISO ?? order.paidAtISO ?? order.placedAtISO;
  return new Date(anchor);
}

export function isOrderEligibleForReturn(order: {
  status: string;
  deliveredAtISO?: string;
  paidAtISO?: string;
  placedAtISO: string;
}): { ok: true } | { ok: false; reason: string } {
  if (order.status !== "delivered" && order.status !== "confirmed") {
    return {
      ok: false,
      reason: "Only confirmed or delivered orders can be returned.",
    };
  }
  const anchor = returnWindowAnchor(order);
  const cutoff = new Date(
    anchor.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );
  if (Date.now() > cutoff.getTime()) {
    return {
      ok: false,
      reason: `Returns must be requested within ${RETURN_WINDOW_DAYS} days of delivery or confirmation.`,
    };
  }
  return { ok: true };
}

/**
 * Destructured line items for an existing OrderReturn row.
 */
function itemsOf(order: { items: OrderItem[] }, entries: OrderReturnEntry[]): {
  ok: true;
  items: OrderItem[];
  subtotalCents: number;
} | { ok: false; error: string } {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { ok: false, error: "Choose at least one item to return." };
  }
  const seen = new Set<string>();
  const items: OrderItem[] = [];
  let subtotalCents = 0;
  for (const entry of entries) {
    const productId =
      typeof entry?.productId === "string" ? entry.productId : "";
    const quantity = Math.floor(Number(entry?.quantity));
    const orderItem = order.items.find((item) => item.productId === productId);
    if (!orderItem) {
      return { ok: false, error: "One of the items isn't part of this order." };
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { ok: false, error: "One of the return quantities is invalid." };
    }
    if (quantity > orderItem.quantity) {
      return {
        ok: false,
        error: "You can't return more of an item than you ordered.",
      };
    }
    if (seen.has(productId)) {
      return { ok: false, error: "Duplicate items aren't allowed." };
    }
    seen.add(productId);
    items.push({
      productId: orderItem.productId,
      name: orderItem.name,
      image: orderItem.image,
      priceCents: orderItem.priceCents,
      quantity,
    });
    subtotalCents += orderItem.priceCents * quantity;
  }
  return { ok: true, items, subtotalCents };
}

/**
 * Requests a return for an owned order. Enforces the 30-day / status
 * eligibility on the server. Creates the OrderReturn as "requested" and appends
 * an audit event. Returns the persisted return.
 */
export async function requestOrderReturn(input: {
  userId: string;
  orderId: string;
  entries: OrderReturnEntry[];
  reason: string;
}): Promise<
  | { ok: true; return: OrderReturn }
  | { ok: false; error: string }
> {
  const { userId, orderId } = input;
  const order = await getOrderById(orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (!(await orderOwnerIs(userId, orderId))) {
    return { ok: false, error: "You can only request returns for your own orders." };
  }

  const eligibility = isOrderEligibleForReturn(order);
  if (!eligibility.ok) return { ok: false, error: eligibility.reason };

  const reason = input.reason?.trim();
  if (!reason || reason.length < 4 || reason.length > 500) {
    return { ok: false, error: "Please enter a reason (4–500 characters)." };
  }

  const lines = itemsOf(order, input.entries);
  if (!lines.ok) return { ok: false, error: lines.error };

  const created = await db.$transaction(async (tx) => {
    const row = await tx.orderReturn.create({
      data: {
        orderId,
        userId,
        items: lines.items as unknown as Prisma.InputJsonValue,
        reason,
        status: "requested",
      },
    });
    await tx.orderEvent.create({
      data: { orderId, eventType: "return_requested", at: new Date() },
    });
    return row;
  });

  return { ok: true, return: toOrderReturn(created) };
}

/**
 * Approves a return, moving it to the "Refund Pending Manual" state with the
 * server-recomputed refund amount. No payment-provider call is made this stage.
 */
export async function approveOrderReturn(input: {
  userId: string;
  orderId: string;
  returnId: string;
  note?: string;
}): Promise<{ ok: true; return: OrderReturn } | { ok: false; error: string }> {
  const order = await getOrderById(input.orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (!(await orderOwnerIs(input.userId, input.orderId))) {
    return { ok: false, error: "You can only manage returns on your own orders." };
  }

  const existing = await db.orderReturn.findUnique({
    where: { id: input.returnId },
  });
  if (!existing || existing.orderId !== input.orderId) {
    return { ok: false, error: "Return request not found." };
  }
  if (existing.status !== "requested") {
    return { ok: false, error: "Only requested returns can be approved." };
  }

  const items = existing.items as unknown as OrderItem[];
  const refundCents = Math.min(
    items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    order.totalCents
  );

  const now = new Date();
  const approved = await db.$transaction(async (tx) => {
    const row = await tx.orderReturn.update({
      where: { id: input.returnId },
      data: {
        status: "refund_pending_manual",
        refundCents,
        approvedAt: now,
      },
    });
    await tx.orderEvent.create({
      data: {
        orderId: input.orderId,
        eventType: "return_approved",
        note: input.note?.trim() || `Refund of ${refundCents} pending manual settlement.`,
        at: now,
      },
    });
    return row;
  });

  return { ok: true, return: toOrderReturn(approved) };
}

export async function rejectOrderReturn(input: {
  userId: string;
  orderId: string;
  returnId: string;
  reason: string;
}): Promise<{ ok: true; return: OrderReturn } | { ok: false; error: string }> {
  const order = await getOrderById(input.orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (!(await orderOwnerIs(input.userId, input.orderId))) {
    return { ok: false, error: "You can only manage returns on your own orders." };
  }

  const existing = await db.orderReturn.findUnique({
    where: { id: input.returnId },
  });
  if (!existing || existing.orderId !== input.orderId) {
    return { ok: false, error: "Return request not found." };
  }
  if (existing.status !== "requested") {
    return { ok: false, error: "Only requested returns can be rejected." };
  }

  const reason = input.reason?.trim();
  if (!reason || reason.length < 4 || reason.length > 500) {
    return { ok: false, error: "Please give a short rejection reason (4–500 characters)." };
  }

  const now = new Date();
  const rejected = await db.$transaction(async (tx) => {
    const row = await tx.orderReturn.update({
      where: { id: input.returnId },
      data: { status: "rejected", rejectedAt: now, rejectedReason: reason },
    });
    await tx.orderEvent.create({
      data: {
        orderId: input.orderId,
        eventType: "return_rejected",
        note: reason,
        at: now,
      },
    });
    return row;
  });

  return { ok: true, return: toOrderReturn(rejected) };
}

/**
 * Human-only completion of a refund. Marks the pending-manual refund as
 * refunded. No payment-provider call is made this stage.
 */
export async function markOrderReturnRefunded(input: {
  userId: string;
  orderId: string;
  returnId: string;
  note?: string;
}): Promise<{ ok: true; return: OrderReturn } | { ok: false; error: string }> {
  const order = await getOrderById(input.orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (!(await orderOwnerIs(input.userId, input.orderId))) {
    return { ok: false, error: "You can only manage returns on your own orders." };
  }

  const existing = await db.orderReturn.findUnique({
    where: { id: input.returnId },
  });
  if (!existing || existing.orderId !== input.orderId) {
    return { ok: false, error: "Return request not found." };
  }
  if (existing.status !== "refund_pending_manual") {
    return { ok: false, error: "Only approved (refund pending manual) returns can be refunded." };
  }

  const now = new Date();
  const refunded = await db.$transaction(async (tx) => {
    const row = await tx.orderReturn.update({
      where: { id: input.returnId },
      data: { status: "refunded", refundedAt: now },
    });
    await tx.orderEvent.create({
      data: {
        orderId: input.orderId,
        eventType: "return_refunded",
        note: input.note?.trim() || null,
        at: now,
      },
    });
    return row;
  });

  return { ok: true, return: toOrderReturn(refunded) };
}

async function orderOwnerIs(userId: string, orderId: string): Promise<boolean> {
  const row = await db.order.findUnique({
    where: { id: orderId },
    select: { userId: true },
  });
  return row?.userId === userId;
}