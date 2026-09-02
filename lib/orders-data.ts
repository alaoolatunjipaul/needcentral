import "server-only";

import { db } from "@/lib/db";
import {
  Prisma,
  type Order as OrderRow,
  type OrderItem as OrderItemRow,
} from "@/lib/generated/prisma/client";
import type {
  Address,
  DeliveryOptionId,
  Order,
  OrderStatus,
  PickupStation,
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
    include: { items: true },
  });
  return rows.map(toOrder);
}

function toOrder(row: OrderRow & { items: OrderItemRow[] }): Order {
  return {
    id: row.id,
    email: row.email,
    items: row.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      image: item.image,
      priceCents: item.priceCents,
      quantity: item.quantity,
    })),
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
  };
}