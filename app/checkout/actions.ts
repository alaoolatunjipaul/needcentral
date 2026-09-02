"use server";

import { getServerSession } from "@/lib/auth-service";
import { createOrder } from "@/lib/orders-data";
import type { Order } from "@/types";

export type PlaceOrderResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Persists a completed checkout to PostgreSQL, scoped to the signed-in user.
 * Guests hit the auth guard and fall back to their existing per-device
 * localStorage flow (the client still saves locally either way).
 */
export async function placeOrder(order: Order): Promise<PlaceOrderResult> {
  try {
    const session = await getServerSession();
    if (!session) {
      return { ok: false, error: "You must be signed in to save this order." };
    }

    if (
      !order ||
      typeof order !== "object" ||
      !Array.isArray(order.items) ||
      order.items.length === 0 ||
      typeof order.totalCents !== "number"
    ) {
      return { ok: false, error: "Your order is empty." };
    }

    await createOrder(session.id, order);
    return { ok: true, id: order.id };
  } catch (err) {
    console.error("placeOrder failed:", err);
    return { ok: false, error: "Unable to save your order. Please try again." };
  }
}