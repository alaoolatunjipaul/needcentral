import "server-only";

import { db } from "@/lib/db";
import type { Order, OrderEventType, OrderStatus } from "@/types";
import { getOrderById, toOrder } from "@/lib/orders-data";

// Stage #5 order lifecycle enforcement. Every state change flows through
// advanceOrderStatus, which validates the transition against the table below,
// stamps the matching fulfillment timestamps / tracking number, and appends an
// immutable OrderEvent row at once inside a transaction. Buyer-facing
// fulfillment advancement is simulated through the order-owner flow this stage
// (no seller dashboard).

export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "shipped", "delivered", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export type AdvanceOrderStatusInput = {
  nextStatus: OrderStatus;
  note?: string;
  /** Static tracking number applied when the order becomes "shipped". */
  trackingNumber?: string;
};

/**
 * Advances an order to `nextStatus` after enforcing the legal transition
 * table. Returns the updated order, or an error string when the transition is
 * not allowed / the order no longer exists. Idempotent for identical statuses.
 */
export async function advanceOrderStatus(
  orderId: string,
  input: AdvanceOrderStatusInput
): Promise<{ ok: true; order: Order } | { ok: false; error: string }> {
  const current = await getOrderById(orderId);
  if (!current) return { ok: false, error: "Order not found." };

  if (current.status === input.nextStatus) {
    return { ok: true, order: current };
  }

  const allowed = ORDER_TRANSITIONS[current.status] ?? [];
  if (!allowed.includes(input.nextStatus)) {
    return {
      ok: false,
      error: `Orders can't move from "${current.status}" to "${input.nextStatus}".`,
    };
  }

  const now = new Date();
  const eventType = toEventType(input.nextStatus);
  const updated = await db.$transaction(async (tx) => {
    const refreshed = await tx.order.findUnique({ where: { id: orderId } });
    if (!refreshed || refreshed.status !== current.status) {
      throw new LifecycleError("Order changed while being updated.");
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: input.nextStatus,
        ...(input.nextStatus === "shipped"
          ? { shippedAt: now, trackingNumber: input.trackingNumber ?? refreshed.trackingNumber }
          : {}),
        ...(input.nextStatus === "delivered" ? { deliveredAt: now } : {}),
      },
    });

    await tx.orderEvent.create({
      data: {
        orderId,
        eventType,
        note: input.note ?? null,
        at: now,
      },
    });

    const withEvents = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, events: true, returns: true },
    });
    if (!withEvents) throw new LifecycleError("Order vanished mid-update.");
    return toOrder(withEvents);
  });

  return { ok: true, order: updated };
}

function toEventType(status: OrderStatus): OrderEventType {
  switch (status) {
    case "pending":
      return "placed";
    case "confirmed":
      return "confirmed";
    case "processing":
      return "processing";
    case "shipped":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
  }
}

export class LifecycleError extends Error {}