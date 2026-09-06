import "server-only";

import { getProductById } from "@/lib/queries";
import {
  getCouponByCode,
  getDeliveryOptionById,
  getPickupStationById,
} from "@/lib/data";
import {
  couponDiscountCents,
  isCrossBorderCountry,
  resolveShippingCents,
} from "@/lib/utils";
import type {
  Address,
  DeliveryOptionId,
  Order,
  OrderItem,
  PickupStation,
} from "@/types";

export const MAX_ORDER_ITEMS = 50;
export const MAX_ITEM_QUANTITY = 99;

export type AssembleOrderInput = {
  email: string;
  items: Array<{ productId: string; quantity: number }>;
  deliveryOptionId: DeliveryOptionId;
  shippingAddress?: Address;
  pickupStationId?: string;
  couponCode?: string;
};

export type AssembleOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };

/**
 * Shared, trusted order assembler used by both the Paystack checkout flow
 * (app/checkout/actions.ts) and the REST endpoint (app/api/orders/route.ts).
 *
 * Only the whitelisted input above is accepted. Every price, line total,
 * subtotal, shipping cost and final total is recomputed server-side from the
 * product catalogue (PostgreSQL) and the delivery / coupon rules — no value
 * sent by a client is treated as authoritative. Payment state and status are
 * never accepted: a newly assembled order always starts `pending` and can only
 * be confirmed by server-side Paystack verification.
 */
export async function assembleOrder(
  input: AssembleOrderInput
): Promise<AssembleOrderResult> {
  if (
    !input ||
    typeof input !== "object" ||
    !Array.isArray(input.items) ||
    input.items.length === 0
  ) {
    return { ok: false, error: "Your order is empty." };
  }
  if (input.items.length > MAX_ORDER_ITEMS) {
    return { ok: false, error: "Your order has too many items." };
  }

  const deliveryOption = getDeliveryOptionById(input.deliveryOptionId);
  if (!deliveryOption) {
    return { ok: false, error: "Please choose a valid delivery option." };
  }

  const isPickup =
    deliveryOption.id === "pickup" && input.pickupStationId !== undefined;

  let pickupStation: PickupStation | undefined;
  if (isPickup) {
    if (input.pickupStationId === undefined) {
      return { ok: false, error: "Please choose a valid pickup station." };
    }
    pickupStation = getPickupStationById(input.pickupStationId);
    if (!pickupStation) {
      return { ok: false, error: "Please choose a valid pickup station." };
    }
  }

  const country = input.shippingAddress?.country?.trim() || "Nigeria";
  const crossBorder = isCrossBorderCountry(country);

  if (crossBorder && deliveryOption.crossBorderAvailable !== true) {
    return {
      ok: false,
      error: "That delivery option isn't available for your country.",
    };
  }

  // Re-read every price from the catalogue (PostgreSQL); reject unknown or
  // unpublished products outright. No value from the client is trusted for
  // pricing or product identity.
  const seen = new Set<string>();
  const items: OrderItem[] = [];
  let subtotalCents = 0;
  for (const line of input.items) {
    const product = await getProductById(line.productId);
    const quantity = Math.floor(Number(line.quantity));
    if (!product) {
      return { ok: false, error: "One of your items is no longer available." };
    }
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      quantity > MAX_ITEM_QUANTITY
    ) {
      return { ok: false, error: "One of your item quantities is invalid." };
    }
    if (seen.has(line.productId)) {
      return { ok: false, error: "Duplicate items aren't allowed." };
    }
    seen.add(line.productId);
    const quantitySafe = Math.min(quantity, MAX_ITEM_QUANTITY);
    items.push({
      productId: product.id,
      name: product.name,
      image: product.image,
      priceCents: product.priceCents,
      quantity: quantitySafe,
    });
    subtotalCents += product.priceCents * quantitySafe;
  }

  const shippingCents = resolveShippingCents(
    subtotalCents,
    deliveryOption,
    country
  );

  let couponCode: string | undefined;
  let couponDescription: string | undefined;
  let discountCents = 0;
  if (typeof input.couponCode === "string" && input.couponCode.trim()) {
    const coupon = getCouponByCode(input.couponCode);
    if (!coupon) {
      return { ok: false, error: "That coupon code isn't valid." };
    }
    couponCode = coupon.code;
    couponDescription = coupon.description;
    discountCents = couponDiscountCents(subtotalCents, coupon);
  }

  const totalCents = subtotalCents + shippingCents - discountCents;
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
    return { ok: false, error: "Your order total couldn't be calculated." };
  }

  const placedAtISO = new Date().toISOString();
  const etaMaxDays = crossBorder
    ? deliveryOption.crossBorderEtaMaxDays ?? deliveryOption.etaMaxDays
    : isPickup
      ? pickupStation?.etaDays ?? deliveryOption.etaMaxDays
      : deliveryOption.etaMaxDays;
  const estimatedDeliveryISO = new Date(
    new Date(placedAtISO).getTime() + etaMaxDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const email = input.email?.trim().toLowerCase() || "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const order: Order = {
    id: generateOrderId(),
    email,
    items,
    subtotalCents,
    shippingCents,
    totalCents,
    // Never client-settable: stays pending until Paystack verification.
    status: "pending",
    deliveryOptionId: deliveryOption.id,
    ...(crossBorder ? { crossBorder } : {}),
    ...(pickupStation ? { pickupStation } : {}),
    ...(isPickup ? {} : { shippingAddress: input.shippingAddress }),
    placedAtISO,
    estimatedDeliveryISO,
    ...(couponCode && discountCents > 0
      ? {
          couponCode,
          couponDescription: couponDescription ?? undefined,
          discountCents,
        }
      : {}),
  };
  return { ok: true, order };
}

function generateOrderId(): string {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `NC-${Date.now().toString(36).toUpperCase()}-${random}`;
}