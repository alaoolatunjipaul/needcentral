"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  ShoppingBag,
  User,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { btnPrimary, containerClass, inputBase } from "@/lib/ui";
import { computeCartTotals, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";

interface PlacedOrder {
  id: string;
  email: string;
  items: CartItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  placedAtISO: string;
}

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "Australia",
] as const;

function generateOrderId(): string {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VD-${Date.now().toString(36).toUpperCase()}-${random}`;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const totals = computeCartTotals(items);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const order: PlacedOrder = {
      id: generateOrderId(),
      email,
      items,
      subtotalCents: totals.subtotalCents,
      shippingCents: totals.shippingCents,
      totalCents: totals.totalCents,
      placedAtISO: new Date().toISOString(),
    };
    setPlacedOrder(order);
    clearCart();
    window.scrollTo({ top: 0 });
  }

  if (placedOrder) {
    const deliveryDate = new Date(
      new Date(placedOrder.placedAtISO).getTime() + 7 * 24 * 60 * 60 * 1000
    ).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    return (
      <div className={containerClass}>
        <div className="mx-auto max-w-2xl py-12 text-center lg:py-16">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 aria-hidden="true" className="size-9" />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            Order confirmed!
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500 sm:text-base">
            Thanks for shopping with Vendora. A confirmation email is on its way
            to <strong className="text-zinc-900">{placedOrder.email}</strong>.
          </p>

          <dl className="mt-8 grid gap-3 rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-zinc-200 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Order number
              </dt>
              <dd className="mt-1 font-mono text-sm font-bold text-zinc-900">
                {placedOrder.id}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Estimated delivery
              </dt>
              <dd className="mt-1 text-sm font-medium text-zinc-900">{deliveryDate}</dd>
            </div>
          </dl>

          <ul className="mt-4 divide-y divide-zinc-200 rounded-2xl bg-white p-2 text-left shadow-sm ring-1 ring-zinc-200">
            {placedOrder.items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 p-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-zinc-200">
                  <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-500 tabular-nums">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-zinc-900">
                  {formatPrice(item.priceCents * item.quantity)}
                </p>
              </li>
            ))}
            <li className="flex items-center justify-between p-3 text-sm">
              <span className="font-medium text-zinc-500">
                Subtotal + shipping ({placedOrder.shippingCents === 0 ? "free" : formatPrice(placedOrder.shippingCents)})
              </span>
              <span className="font-bold tabular-nums text-zinc-950">
                {formatPrice(placedOrder.totalCents)} paid
              </span>
            </li>
          </ul>

          <p className="mt-5 text-xs leading-5 text-zinc-400">
            This is a simulated checkout for demo purposes — no real payment was
            processed and nothing will actually ship.
          </p>

          <Link href="/products" className={`${btnPrimary} mt-7`}>
            Continue shopping
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    );
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
          Simulated frontend flow — fill in the details and place a demo order.
        </p>
      </header>

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

          <section aria-labelledby="shipping-heading" className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <h2 id="shipping-heading" className="flex items-center gap-2 text-lg font-bold text-zinc-900">
              <MapPin aria-hidden="true" className="size-5 text-brand-600" />
              Shipping address
            </h2>
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
                  placeholder="Alex Johnson"
                  className={inputBase}
                />
              </div>
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
                  placeholder="123 Market Street"
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
                  placeholder="Portland"
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
                  placeholder="97201"
                  className={inputBase}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-country" className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Country
                </label>
                <select id="checkout-country" name="country" required autoComplete="country-name" className={inputBase}>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section aria-labelledby="payment-heading" className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <div className="flex items-center justify-between gap-3">
              <h2 id="payment-heading" className="flex items-center gap-2 text-lg font-bold text-zinc-900">
                <CreditCard aria-hidden="true" className="size-5 text-brand-600" />
                Payment
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                <Lock aria-hidden="true" className="size-3" />
                Demo only
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              No real payment is processed — any values work, or use the sample card below.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label htmlFor="checkout-card" className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Card number
                </label>
                <input
                  id="checkout-card"
                  name="cardNumber"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={19}
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  defaultValue="4242 4242 4242 4242"
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="checkout-expiry" className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Expiry
                </label>
                <input
                  id="checkout-expiry"
                  name="expiry"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={5}
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  defaultValue="12/29"
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="checkout-cvc" className="mb-1.5 block text-sm font-medium text-zinc-700">
                  CVC
                </label>
                <input
                  id="checkout-cvc"
                  name="cvc"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="cc-csc"
                  placeholder="123"
                  defaultValue="123"
                  className={inputBase}
                />
              </div>
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
            <dl className="mt-5 space-y-3 border-t border-zinc-200 pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Subtotal</dt>
                <dd className="font-medium tabular-nums text-zinc-900">
                  {formatPrice(totals.subtotalCents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Shipping</dt>
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
                  {formatPrice(totals.totalCents)}
                </dd>
              </div>
            </dl>
            <button type="submit" className={`${btnPrimary} mt-6 w-full`}>
              Place order · {formatPrice(totals.totalCents)}
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
