"use server";

import { getServerSession } from "@/lib/auth-service";
import { createOrder } from "@/lib/orders-data";
import {
  getCouponByCode,
  getDeliveryOptionById,
  getPickupStationById,
  getProductById,
} from "@/lib/data";
import { initializePayment } from "@/lib/paystack";
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

const MAX_ORDER_ITEMS = 50;
const MAX_ITEM_QUANTITY = 99;

export type StartCheckoutPaymentInput = {
  email: string;
  items: Array<{ productId: string; quantity: number }>;
  deliveryOptionId: DeliveryOptionId;
  shippingAddress?: Address;
  pickupStationId?: string;
  couponCode?: string;
};

export type StartCheckoutPaymentResult =
  | {
      ok: true;
      orderId: string;
      reference: string;
      amountCents: number;
      authorizationUrl: string;
      accessCode: string;
    }
  | { ok: false; code: "auth" | "invalid" | "provider" | "retry"; error: string };

/**
 * Begins the Paystack checkout for an authenticated customer:
 *   1. validates the checkout payload,
 *   2. recomputes the order server-side from the product catalog / delivery /
 *      coupon rules (never trusts a client-supplied total),
 *   3. persists the order as `pending` (payment not yet verified),
 *   4. initializes a Paystack transaction with the server-computed amount,
 *   5. returns the Paystack authorization URL for the client to redirect to.
 *
 * The amount charged is always the server-recomputed total; a redirect into
 * Paystack alone never confirms the order (see the callback / webhook).
 */
export async function startCheckoutPayment(
  input: StartCheckoutPaymentInput
): Promise<StartCheckoutPaymentResult> {
  try {
    const session = await getServerSession();
    if (!session) {
      return {
        ok: false,
        code: "auth",
        error: "Please sign in to complete your order and pay.",
      };
    }

    const assembled = assembleOrder(input);
    if (!assembled.ok) {
      return { ok: false, code: "invalid", error: assembled.error };
    }

    const order = assembled.order;
    const callbackUrl = `${appUrl()}/orders?paid=return&ref=${encodeURIComponent(
      order.id
    )}`;

    const initialized = await initializePayment({
      reference: order.id,
      amountCents: order.totalCents,
      email: order.email,
      currency: "NGN",
      callbackUrl,
    });

    if (!initialized.ok) {
      console.error("Paystack initialize failed:", initialized.code);
      return {
        ok: false,
        code: "provider",
        error:
          "We couldn't reach the payment provider right now. Please try again.",
      };
    }

    // Persist the order as pending only after the transaction initializes so we
    // do not keep abandoned checkout rows around when Paystack is unavailable.
    await createOrder(session.id, order);

    return {
      ok: true,
      orderId: order.id,
      reference: order.id,
      amountCents: order.totalCents,
      authorizationUrl: initialized.authorizationUrl,
      accessCode: initialized.accessCode,
    };
  } catch (err) {
    console.error("startCheckoutPayment failed:", err);
    return {
      ok: false,
      code: "retry",
      error:
        "Something went wrong starting your payment. Please try again in a moment.",
    };
  }
}

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000"
  );
}

/**
 * Rebuilds the order from authoritative server data. Returns an error for any
 * invalid or tampered input (unknown product, bad delivery option, empty cart,
 * invalid pickup, etc.). No value coming from the client is trusted for
 * pricing — every price is re-read from the product catalog.
 */
function assembleOrder(
  input: StartCheckoutPaymentInput
): { ok: true; order: Order } | { ok: false; error: string } {
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

  const country =
    input.shippingAddress?.country?.trim() || "Nigeria";
  const crossBorder = isCrossBorderCountry(country);

  if (crossBorder && deliveryOption.crossBorderAvailable !== true) {
    return {
      ok: false,
      error: "That delivery option isn't available for your country.",
    };
  }

  // Re-read every price from the catalog; reject unknown products outright.
  const seen = new Set<string>();
  const items: OrderItem[] = [];
  let subtotalCents = 0;
  for (const line of input.items) {
    const product = getProductById(line.productId);
    const quantity = Math.floor(Number(line.quantity));
    if (!product) {
      return { ok: false, error: "One of your items is no longer available." };
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > MAX_ITEM_QUANTITY) {
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

  const orderId = generateOrderId();
  const order: Order = {
    id: orderId,
    email,
    items,
    subtotalCents,
    shippingCents,
    totalCents,
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
