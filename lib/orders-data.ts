import "server-only";

import { db } from "@/lib/db";
import {
  Prisma,
  type Order as OrderRow,
  type OrderItem as OrderItemRow,
  type OrderEvent as OrderEventRow,
  type OrderReturn as OrderReturnRow,
} from "@/lib/generated/prisma/client";
import type {
  Address,
  DeliveryOptionId,
  Order,
  OrderEvent,
  OrderEventType,
  OrderItem,
  OrderReturn,
  OrderStatus,
  PickupStation,
  ReturnStatus,
} from "@/types";

// Server-side data-access layer for Project 7 order persistence. Follows the
// conventions of lib/auth-data.ts: server-only, Prisma-backed, returns plain
// shapes. Orders are scoped to the signed-in user; createOrder/listOrders are
// called from the checkout Server Action and the /orders server page.

export type CreateOrderInput = Pick<
  Order,
  | "id"
  | "email"
  | "items"
  | "subtotalCents"
  | "shippingCents"
  | "totalCents"
  | "status"
  | "deliveryOptionId"
  | "crossBorder"
  | "pickupStation"
  | "shippingAddress"
  | "placedAtISO"
  | "estimatedDeliveryISO"
  | "couponCode"
  | "couponDescription"
  | "discountCents"
>;

export async function createOrder(userId: string, input: CreateOrderInput) {
  return db.order.create({
    data: {
      id: input.id,
      userId,
      email: input.email,
      subtotalCents: input.subtotalCents,
      shippingCents: input.shippingCents,
      totalCents: input.totalCents,
      status: input.status,
      deliveryOptionId: input.deliveryOptionId,
      crossBorder: input.crossBorder ?? false,
      pickupStation:
        input.pickupStation === undefined
          ? undefined
          : (input.pickupStation as unknown as Prisma.InputJsonValue),
      shippingAddress:
        input.shippingAddress === undefined
          ? undefined
          : (input.shippingAddress as unknown as Prisma.InputJsonValue),
      placedAtISO: new Date(input.placedAtISO),
      estimatedDeliveryISO: new Date(input.estimatedDeliveryISO),
      couponCode: input.couponCode ?? null,
      couponDescription: input.couponDescription ?? null,
      discountCents: input.discountCents ?? null,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          priceCents: item.priceCents,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });
}

export async function listOrdersByUserId(userId: string): Promise<Order[]> {
  const rows = await db.order.findMany({
    where: { userId },
    orderBy: { placedAtISO: "desc" },
    include: orderInclude,
  });
  return rows.map(toOrder);
}

export type OrderRowWithItems = OrderRow & {
  items: OrderItemRow[];
  events?: OrderEventRow[];
  returns?: OrderReturnRow[];
};

export function toOrder(row: OrderRowWithItems): Order {
  return {
    id: row.id,
    email: row.email,
    items: row.items.map(toOrderItem),
    subtotalCents: row.subtotalCents,
    shippingCents: row.shippingCents,
    totalCents: row.totalCents,
    status: row.status as OrderStatus,
    deliveryOptionId: row.deliveryOptionId as DeliveryOptionId,
    crossBorder: row.crossBorder,
    ...(row.pickupStation !== null
      ? { pickupStation: row.pickupStation as unknown as PickupStation }
      : {}),
    ...(row.shippingAddress !== null
      ? { shippingAddress: row.shippingAddress as unknown as Address }
      : {}),
    placedAtISO: row.placedAtISO.toISOString(),
    estimatedDeliveryISO: row.estimatedDeliveryISO.toISOString(),
    ...(row.couponCode !== null && row.couponCode !== undefined
      ? { couponCode: row.couponCode }
      : {}),
    ...(row.couponDescription !== null &&
    row.couponDescription !== undefined
      ? { couponDescription: row.couponDescription }
      : {}),
    ...(row.discountCents !== null && row.discountCents !== undefined
      ? { discountCents: row.discountCents }
      : {}),
    ...(row.paymentProvider !== null && row.paymentProvider !== undefined
      ? { paymentProvider: row.paymentProvider as "paystack" }
      : {}),
    ...(row.paymentReference !== null && row.paymentReference !== undefined
      ? { paymentReference: row.paymentReference }
      : {}),
    ...(row.paidAt !== null && row.paidAt !== undefined
      ? { paidAtISO: row.paidAt.toISOString() }
      : {}),
    ...(row.trackingNumber !== null && row.trackingNumber !== undefined
      ? { trackingNumber: row.trackingNumber }
      : {}),
    ...(row.shippedAt !== null && row.shippedAt !== undefined
      ? { shippedAtISO: row.shippedAt.toISOString() }
      : {}),
    ...(row.deliveredAt !== null && row.deliveredAt !== undefined
      ? { deliveredAtISO: row.deliveredAt.toISOString() }
      : {}),
    ...(row.events !== undefined
      ? {
          events: [...row.events]
            .sort((a, b) => a.at.getTime() - b.at.getTime())
            .map(toOrderEvent),
        }
      : {}),
    ...(row.returns !== undefined
      ? {
          returns: [...row.returns]
            .sort((a, b) => a.requestedAt.getTime() - b.requestedAt.getTime())
            .map(toOrderReturn),
        }
      : {}),
  };
}

function toOrderItem(item: OrderItemRow): OrderItem {
  return {
    productId: item.productId,
    name: item.name,
    image: item.image,
    priceCents: item.priceCents,
    quantity: item.quantity,
  };
}

function toOrderEvent(event: OrderEventRow): OrderEvent {
  return {
    id: event.id,
    orderId: event.orderId,
    eventType: event.eventType as OrderEventType,
    ...(event.note !== null && event.note !== undefined
      ? { note: event.note }
      : {}),
    atISO: event.at.toISOString(),
  };
}

export function toOrderReturn(returnRow: OrderReturnRow): OrderReturn {
  return {
    id: returnRow.id,
    orderId: returnRow.orderId,
    userId: returnRow.userId,
    items: (returnRow.items as unknown as OrderItem[]),
    reason: returnRow.reason,
    status: returnRow.status as ReturnStatus,
    ...(returnRow.refundCents !== null && returnRow.refundCents !== undefined
      ? { refundCents: returnRow.refundCents }
      : {}),
    requestedAtISO: returnRow.requestedAt.toISOString(),
    ...(returnRow.approvedAt !== null && returnRow.approvedAt !== undefined
      ? { approvedAtISO: returnRow.approvedAt.toISOString() }
      : {}),
    ...(returnRow.rejectedAt !== null && returnRow.rejectedAt !== undefined
      ? { rejectedAtISO: returnRow.rejectedAt.toISOString() }
      : {}),
    ...(returnRow.rejectedReason !== null &&
    returnRow.rejectedReason !== undefined
      ? { rejectedReason: returnRow.rejectedReason }
      : {}),
    ...(returnRow.refundedAt !== null && returnRow.refundedAt !== undefined
      ? { refundedAtISO: returnRow.refundedAt.toISOString() }
      : {}),
  };
}

const orderInclude = {
  items: true,
  events: true,
  returns: true,
} as const;

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  const row = await db.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });
  return row ? toOrder(row) : undefined;
}

/**
 * Returns the owner (userId) of an order, or null if it does not exist. Used to
 * scope payment-callback confirmation to the signed-in owner before the order
 * is marked paid.
 */
export async function getOrderOwnerId(
  orderId: string
): Promise<string | null> {
  const row = await db.order.findUnique({
    where: { id: orderId },
    select: { userId: true },
  });
  return row?.userId ?? null;
}

/**
 * Marks an order as paid and confirmed after server-side gateway
 * verification. Idempotent: repeated callbacks / webhooks for an already-paid
 * order are no-ops. Returns the resulting order, or null if not found.
 */
export async function markOrderPaid(
  orderId: string,
  input: { provider: "paystack"; reference: string; paidAtISO: string }
): Promise<Order | null> {
  const updated = await db.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });
    if (!existing) return null;

    // Idempotency: never re-apply or change details on an order that is
    // already confirmed / paid.
    if (existing.status !== "pending") {
      return toOrder(existing);
    }

    const paidAt = new Date(input.paidAtISO);
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "confirmed",
        paymentProvider: input.provider,
        paymentReference: input.reference,
        paidAt,
      },
    });

    await tx.orderEvent.create({
      data: { orderId, eventType: "confirmed", at: paidAt },
    });

    const result = await tx.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });
    return result ? toOrder(result) : null;
  });
  return updated;
}
