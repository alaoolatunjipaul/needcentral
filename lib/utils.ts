import type { CartItem, CartTotals } from "@/types";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export const FREE_SHIPPING_THRESHOLD_CENTS = 7500;
export const FLAT_SHIPPING_CENTS = 699;

export function computeCartTotals(items: CartItem[]): CartTotals {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
      ? 0
      : FLAT_SHIPPING_CENTS;
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
