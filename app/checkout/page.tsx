"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CreditCard,
  Globe,
  Lock,
  MapPin,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { CouponPanel } from "@/components/coupons/CouponPanel";
import { useCoupons } from "@/components/coupons/CouponProvider";
import {
  getDeliveryOptionById,
  getDeliveryOptions,
  getPickupStations,
} from "@/lib/data";
import { btnPrimary, containerClass, inputBase } from "@/lib/ui";
import {
  computeCartTotals,
  couponDiscountCents,
  formatPrice,
  FREE_SHIPPING_THRESHOLD_CENTS,
  isCrossBorderCountry,
  MARKET_CONFIG,
  resolveShippingCents,
} from "@/lib/utils";
import type {
  Address,
  DeliveryOptionId,
  PickupStation,
} from "@/types";
import { startCheckoutPayment } from "./actions";

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Rwanda",
  "Benin",
  "Côte d’Ivoire",
  "Senegal",
  "Tanzania",
  "United States",
  "United Kingdom",
  "Germany",
  "Canada",
] as const;

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { coupon } = useCoupons();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryId, setDeliveryId] = useState<DeliveryOptionId>("standard");
  const [country, setCountry] = useState<string>(MARKET_CONFIG.country);
  const [pickupStationId, setPickupStationId] = useState<string>(
    getPickupStations()[0]?.id ?? ""
  );

  const crossBorder = isCrossBorderCountry(country);
  const deliveryOptions = getDeliveryOptions().filter(
    (option) => crossBorder !== true || option.crossBorderAvailable === true
  );
  const selectedDelivery =
    getDeliveryOptionById(deliveryId) &&
    deliveryOptions.some((o) => o.id === deliveryId)
      ? getDeliveryOptionById(deliveryId)!
      : deliveryOptions[0];
  const pickupStations = getPickupStations();
  const selectedPickupStation: PickupStation | undefined =
    pickupStations.find((station) => station.id === pickupStationId) ??
    pickupStations[0];
  const totals = computeCartTotals(items, selectedDelivery, country);
  const discountCents =
    coupon !== null ? couponDiscountCents(totals.subtotalCents, coupon) : 0;
  const finalTotalCents = totals.totalCents - discountCents;
  const isPickup =
    deliveryId === "pickup" && !crossBorder && selectedDelivery?.id === "pickup";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0 || !selectedDelivery || submitting) return;
    const data = new FormData(event.currentTarget);

    const isPickupOrder =
      selectedDelivery.id === "pickup" && !crossBorder && !!selectedPickupStation;

    const shippingAddress: Address | undefined = isPickupOrder
      ? undefined
      : {
          fullName: String(data.get("name") ?? ""),
          street: String(data.get("address") ?? ""),
          city: String(data.get("city") ?? ""),
          postalCode: String(data.get("postalCode") ?? ""),
          country: String(data.get("country") ?? MARKET_CONFIG.country),
        };

    setErrorMsg(null);
    setSubmitting(true);

    // The server recomputes the authoritative total and returns a Paystack
    // authorization URL. On success we clear the cart and redirect the customer
    // to Paystack; the order stays "pending" until server-side verification.
    void startCheckoutPayment({
      email: String(data.get("email") ?? ""),
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      deliveryOptionId: selectedDelivery.id,
      ...(isPickupOrder ? { pickupStationId: selectedPickupStation!.id } : {}),
      ...(shippingAddress ? { shippingAddress } : {}),
      ...(coupon !== null ? { couponCode: coupon.code } : {}),
    }).then((result) => {
      if (!result.ok) {
        setSubmitting(false);
        setErrorMsg(result.error);
        return;
      }
      clearCart();
      window.location.assign(result.authorizationUrl);
    });
  }

  if (items.length === 0) {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-20 my-8 text-center sm:my-12">
          <span className="grid size-16 place-items-center rounded-full bg-zinc-100 text-zinc-400">
            <ShoppingBag aria-hidden="true" className="size-8" />
          </span>
          <h1 className="mt-5 text-xl font-bold text-zinc-900">
            Nothing to check out yet
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            Your cart is empty. Add a few products first, then come back to
            complete your (simulated) order.
          </p>
          <Link href="/products" className={`${btnPrimary} mt-7`}>
            Browse products
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <header className="py-8 lg:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base">
          Review your order, then pay securely with Paystack.
        </p>
      </header>

      {errorMsg && (
        <div
          role="alert"
          className="mb-8 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200"
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-10 pb-16 lg:grid-cols-[1fr_380px] lg:gap-12" noValidate={false}>
        <div className="space-y-6">
          <section aria-labelledby="contact-heading" className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <h2 id="contact-heading" className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <User aria-hidden="true" className="size-5 text-brand-600" />
              Contact
            </h2>
            <div className="mt-5">
              <label htmlFor="checkout-email" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Email address
              </label>
              <input
                id="checkout-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputBase}
              />
            </div>
          </section>

          <section
            aria-labelledby={
              isPickup ? "pickup-heading" : "shipping-heading"
            }
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
          >
            <h2
              id={isPickup ? "pickup-heading" : "shipping-heading"}
              className="flex items-center gap-2 text-lg font-bold text-zinc-900"
            >
              <MapPin aria-hidden="true" className="size-5 text-brand-600" />
              {isPickup ? "Pickup station" : "Shipping address"}
            </h2>

            {isPickup ? (
              <div className="mt-5">
                <p className="text-sm leading-6 text-zinc-500">
                  Skip the queue — pick up your order from a NeedCentral point
                  near you. Ready in about{" "}
                  {selectedPickupStation
                    ? `${selectedPickupStation.etaDays} days`
                    : "a few days"}
                  .
                </p>
                <div className="mt-4 grid gap-3">
                  {pickupStations.map((station) => {
                    const isSelected = station.id === selectedPickupStation?.id;
                    return (
                      <label
                        key={station.id}
                        className={`flex items-start gap-3 rounded-xl border p-4 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-600 ${
                          isSelected
                            ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600"
                            : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="pickupStation"
                          value={station.id}
                          checked={isSelected}
                          onChange={() => setPickupStationId(station.id)}
                          className="mt-1 size-4 accent-brand-600"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-zinc-900">
                            {station.name}
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                            {station.address}
                          </span>
                          <span className="mt-0.5 block text-xs text-zinc-400">
                            Ready in about {station.etaDays} days
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-name" className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Full name
                  </label>
                  <input
                    id="checkout-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Chidera Okonkwo"
                    className={inputBase}
                  />
                </div>
                {crossBorder && (
                  <div
                    role="note"
                    className="sm:col-span-2 flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800 ring-1 ring-brand-100"
                  >
                    <Globe aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    Cross-border delivery to {country} — door delivery takes a
                    few more days and uses international shipping rates.
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-address" className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Street address
                  </label>
                  <input
                    id="checkout-address"
                    name="address"
                    type="text"
                    required
                    autoComplete="street-address"
                    placeholder="12 Adeola Odeku Street, Victoria Island"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-city" className="mb-1.5 block text-sm font-medium text-zinc-700">
                    City
                  </label>
                  <input
                    id="checkout-city"
                    name="city"
                    type="text"
                    required
                    autoComplete="address-level2"
                    placeholder="Lagos"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-postal" className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Postal code
                  </label>
                  <input
                    id="checkout-postal"
                    name="postalCode"
                    type="text"
                    required
                    autoComplete="postal-code"
                    placeholder="101241"
                    className={inputBase}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-country" className="mb-1.5 block text-sm font-medium text-zinc-700">
                    Country
                  </label>
                  <select
                    id="checkout-country"
                    name="country"
                    required
                    autoComplete="country-name"
                    value={country}
                    onChange={(e) => {
                      const next = e.target.value;
                      setCountry(next);
                      if (
                        isCrossBorderCountry(next) &&
                        deliveryId === "pickup"
                      ) {
                        setDeliveryId("standard");
                      }
                    }}
                    className={inputBase}
                  >
                    {COUNTRIES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="delivery-heading" className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <h2 id="delivery-heading" className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <Truck aria-hidden="true" className="size-5 text-brand-600" />
              Delivery option
            </h2>
            <fieldset className="mt-5">
              <legend className="sr-only">Choose a delivery option</legend>
              <div className="grid gap-3">
                {deliveryOptions.map((option, index) => {
                  const isSelected = option.id === deliveryId;
                  const price = resolveShippingCents(
                    totals.subtotalCents,
                    option,
                    country
                  );
                  const isFree = price === 0;
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-600 ${
                        isSelected
                          ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600"
                          : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryOption"
                        value={option.id}
                        checked={isSelected}
                        onChange={() => setDeliveryId(option.id)}
                        className="mt-1 size-4 accent-brand-600"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-zinc-900">
                          {option.label}
                          {index === 0 && !crossBorder && (
                            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              Popular
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                          {crossBorder && option.crossBorderAvailable
                            ? `${option.label} to ${country} · arrives in ${option.etaMinDays}–${option.crossBorderEtaMaxDays ?? option.etaMaxDays} days`
                            : `${option.description} · arrives in ${option.etaMinDays}–${option.etaMaxDays} days`}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-sm font-bold tabular-nums ${
                          isFree ? "text-emerald-600" : "text-zinc-900"
                        }`}
                      >
                        {isFree ? "Free" : formatPrice(price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <p className="mt-4 text-xs leading-5 text-zinc-500">
              {crossBorder
                ? "Cross-border orders ship internationally at international rates and are not eligible for the domestic free-delivery threshold."
                : `Standard delivery is free on orders over ${formatPrice(
                    FREE_SHIPPING_THRESHOLD_CENTS
                  )}. Pickup is available at NeedCentral points across Lagos, Abuja, Ibadan, Port Harcourt and Kano.`}
            </p>
          </section>

          <section aria-labelledby="payment-heading" className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <div className="flex items-center justify-between gap-3">
              <h2 id="payment-heading" className="flex items-center gap-2 text-lg font-bold text-zinc-900">
                <CreditCard aria-hidden="true" className="size-5 text-brand-600" />
                Payment
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                <Lock aria-hidden="true" className="size-3" />
                Secure · Paystack
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              You&apos;ll be redirected to Paystack, our secure payment partner, to
              complete your order with a card, bank transfer, USSD, QR code or
              bank account. We never see or store your card details.
            </p>
            <div className="mt-5 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 ring-1 ring-zinc-200">
              <span className="font-semibold text-zinc-800">Total to pay</span>{" "}
              <span className="font-bold tabular-nums text-zinc-950">
                {formatPrice(finalTotalCents)}
              </span>{" "}
              <span className="text-zinc-500">({MARKET_CONFIG.currency})</span>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Your order is created as pending and stays pending until Paystack
                confirms the payment. Test mode is enabled — no real transaction
                is charged.
              </p>
            </div>
          </section>
        </div>

        <aside aria-label="Order summary" className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <h2 className="text-lg font-bold text-zinc-900">Order summary</h2>
            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-zinc-200">
                    <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{item.name}</p>
                    <p className="text-xs text-zinc-500 tabular-nums">
                      Qty {item.quantity} · {formatPrice(item.priceCents)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                    {formatPrice(item.priceCents * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <CouponPanel className="mt-5" />
            <dl className="mt-5 space-y-3 border-t border-zinc-200 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Subtotal</dt>
                <dd className="font-medium tabular-nums text-zinc-900">
                  {formatPrice(totals.subtotalCents)}
                </dd>
              </div>
              {discountCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-emerald-600">
                    Discount{coupon ? ` (${coupon.code})` : ""}
                  </dt>
                  <dd className="font-semibold tabular-nums text-emerald-600">
                    -{formatPrice(discountCents)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-zinc-500">
                  Delivery{selectedDelivery ? ` · ${selectedDelivery.label}` : ""}
                </dt>
                <dd
                  className={`font-medium tabular-nums ${
                    totals.shippingCents === 0 ? "text-emerald-600" : "text-zinc-900"
                  }`}
                >
                  {totals.shippingCents === 0 ? "Free" : formatPrice(totals.shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-4 text-base">
                <dt className="font-bold text-zinc-900">Total</dt>
                <dd className="font-extrabold tabular-nums text-zinc-950">
                  {formatPrice(finalTotalCents)}
                </dd>
              </div>
            </dl>
            <button type="submit" disabled={submitting} className={`${btnPrimary} mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60`}>
              {submitting ? "Preparing secure payment…" : `Pay · ${formatPrice(finalTotalCents)}`}
            </button>
            <Link
              href="/cart"
              className="mt-3 block w-full rounded-full py-2.5 text-center text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Back to cart
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
