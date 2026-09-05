"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth-service";
import { advanceOrderStatus } from "@/lib/order-lifecycle";
import { getOrderOwnerId } from "@/lib/orders-data";
import { generateTrackingNumber } from "@/lib/shipping";
import {
  approveOrderReturn,
  markOrderReturnRefunded,
  rejectOrderReturn,
  requestOrderReturn,
  type OrderReturnEntry,
} from "@/lib/returns-data";
import type { Order, OrderReturn } from "@/types";

// Stage #5 server actions for the order-owner flow. Every mutation re-checks
// the server session and the order's ownership before doing anything. Fulfillment
// advancement ("shipped" / "delivered") is simulated through this owner flow for
// this stage — there is no seller dashboard yet (roadmap #6).

export type OrderActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

type OrderAction = OrderActionResult<{ order: Order }>;
type ReturnAction = OrderActionResult<{ return: OrderReturn }>;

async function requireOwner(orderId: string): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, error: "Please sign in to manage your orders." };
  }
  const ownerId = await getOrderOwnerId(orderId);
  if (ownerId !== session.id) {
    return { ok: false, error: "You can only manage your own orders." };
  }
  return { ok: true, userId: session.id };
}

/** Converts unexpected failures into a user-facing message. */
async function guard<T, R>(
  run: () => Promise<R>,
  mapper: (result: R) => T
): Promise<T> {
  try {
    return mapper(await run());
  } catch {
    return {
      ok: false,
      error: "Something went wrong. Please try again in a moment.",
    } as T;
  }
}

export async function markOrderShipped(orderId: string): Promise<OrderAction> {
  const owner = await requireOwner(orderId);
  if (!owner.ok) return owner;

  return guard(
    () =>
      advanceOrderStatus(orderId, {
        nextStatus: "shipped",
        trackingNumber: generateTrackingNumber(orderId),
      }),
    (result) => {
      if (!result.ok) return { ok: false, error: result.error };
      revalidatePath("/orders");
      return { ok: true as const, data: { order: result.order } };
    }
  );
}

export async function markOrderDelivered(orderId: string): Promise<OrderAction> {
  const owner = await requireOwner(orderId);
  if (!owner.ok) return owner;

  return guard(
    () => advanceOrderStatus(orderId, { nextStatus: "delivered" }),
    (result) => {
      if (!result.ok) return { ok: false, error: result.error };
      revalidatePath("/orders");
      return { ok: true as const, data: { order: result.order } };
    }
  );
}

export async function requestReturnAction(
  orderId: string,
  entries: OrderReturnEntry[],
  reason: string
): Promise<ReturnAction> {
  const owner = await requireOwner(orderId);
  if (!owner.ok) return owner;

  return guard(
    () =>
      requestOrderReturn({
        userId: owner.userId,
        orderId,
        entries,
        reason,
      }),
    (result) => {
      if (!result.ok) return { ok: false, error: result.error };
      revalidatePath("/orders");
      return { ok: true as const, data: { return: result.return } };
    }
  );
}

export async function approveReturnAction(
  orderId: string,
  returnId: string,
  note?: string
): Promise<ReturnAction> {
  const owner = await requireOwner(orderId);
  if (!owner.ok) return owner;

  return guard(
    () =>
      approveOrderReturn({
        userId: owner.userId,
        orderId,
        returnId,
        note,
      }),
    (result) => {
      if (!result.ok) return { ok: false, error: result.error };
      revalidatePath("/orders");
      return { ok: true as const, data: { return: result.return } };
    }
  );
}

export async function rejectReturnAction(
  orderId: string,
  returnId: string,
  reason: string
): Promise<ReturnAction> {
  const owner = await requireOwner(orderId);
  if (!owner.ok) return owner;

  return guard(
    () =>
      rejectOrderReturn({
        userId: owner.userId,
        orderId,
        returnId,
        reason,
      }),
    (result) => {
      if (!result.ok) return { ok: false, error: result.error };
      revalidatePath("/orders");
      return { ok: true as const, data: { return: result.return } };
    }
  );
}

export async function markReturnRefundedAction(
  orderId: string,
  returnId: string,
  note?: string
): Promise<ReturnAction> {
  const owner = await requireOwner(orderId);
  if (!owner.ok) return owner;

  return guard(
    () =>
      markOrderReturnRefunded({
        userId: owner.userId,
        orderId,
        returnId,
        note,
      }),
    (result) => {
      if (!result.ok) return { ok: false, error: result.error };
      revalidatePath("/orders");
      return { ok: true as const, data: { return: result.return } };
    }
  );
}