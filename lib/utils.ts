import type { CartItem, CartTotals, Coupon, DeliveryOption } from "@/types";

/**
 * Launch market configuration. Kept in one place so a later multi-currency /
 * multi-country layer (Ghana, Kenya, South Africa, …) can extend it without
 * touching call sites.
 */
export const MARKET_CONFIG = {
  locale: "en-NG",
  currency: "NGN",
  country: "Nigeria",
} as const;

const priceFormatter = new Intl.NumberFormat(MARKET_CONFIG.locale, {
  style: "currency",
  currency: MARKET_CONFIG.currency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export const FREE_SHIPPING_THRESHOLD_CENTS = 7_500_000;
export const FLAT_SHIPPING_CENTS = 250_000;

function defaultShippingCents(subtotalCents: number): number {
  return subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : FLAT_SHIPPING_CENTS;
}

/** Shipping for a subtotal under a chosen delivery option. */
export function resolveShippingCents(
  subtotalCents: number,
  option: DeliveryOption
): number {
  if (
    option.freeThresholdCents !== undefined &&
    subtotalCents >= option.freeThresholdCents
  ) {
    return 0;
  }
  return option.priceCents;
}

export function computeCartTotals(
  items: CartItem[],
  delivery?: DeliveryOption
): CartTotals {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );
  const shippingCents = delivery
    ? resolveShippingCents(subtotalCents, delivery)
    : defaultShippingCents(subtotalCents);
  return { subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

export function discountPercent(
  priceCents: number,
  compareAtPriceCents?: number
): number | null {
  if (
    compareAtPriceCents === undefined ||
    compareAtPriceCents <= priceCents
  ) {
    return null;
  }
  return Math.round((1 - priceCents / compareAtPriceCents) * 100);
}

/**
 * Whether a simulated coupon currently meets its minimum-spend requirement.
 * Shipping and the free-delivery threshold keep using the pre-discount
 * subtotal, so applying a coupon never changes delivery pricing.
 */
export function couponQualifies(
  subtotalCents: number,
  coupon: Coupon
): boolean {
  return (
    coupon.minSubtotalCents === undefined ||
    subtotalCents >= coupon.minSubtotalCents
  );
}

/** Simulated discount for a subtotal; 0 while the minimum spend is unmet. */
export function couponDiscountCents(
  subtotalCents: number,
  coupon: Coupon
): number {
  if (!couponQualifies(subtotalCents, coupon)) return 0;
  if (coupon.percentOff !== undefined) {
    return Math.round((subtotalCents * coupon.percentOff) / 100);
  }
  if (coupon.amountOffCents !== undefined) {
    return Math.min(coupon.amountOffCents, subtotalCents);
  }
  return 0;
}
