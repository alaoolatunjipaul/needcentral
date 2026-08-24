"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/products/QuantityStepper";
import { useCart } from "@/components/cart/CartProvider";
import { btnPrimary, btnSecondary, containerClass } from "@/lib/ui";
import {
  computeCartTotals,
  formatPrice,
  FREE_SHIPPING_THRESHOLD_CENTS,
} from "@/lib/utils";

export default function CartPage() {
  const { items, itemCount, setQuantity, removeItem } = useCart();
  const totals = computeCartTotals(items);
  const isEmpty = items.length === 0;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD_CENTS - totals.subtotalCents;
  const freeShippingProgress = Math.min(
    100,
    (totals.subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100
  );

  return (
    <div className={containerClass}>
      <header className="py-8 lg:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
          Your cart
        </h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base" aria-live="polite">
          {isEmpty
            ? "Items you add will appear here."
            : `${itemCount} item${itemCount === 1 ? "" : "s"} ready for checkout.`}
        </p>
      </header>

      {isEmpty ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center mb-16">
          <span className="grid size-16 place-items-center rounded-full bg-zinc-100 text-zinc-400">
            <ShoppingBag aria-hidden="true" className="size-8" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-zinc-900">Your cart is empty</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            Looks like you have not added anything yet. Explore the catalogue and
            find something you love.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className={btnPrimary}>
              Browse products
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link href="/categories" className={btnSecondary}>
              Explore categories
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-10 pb-16 lg:grid-cols-[1fr_380px] lg:gap-12">
          <section aria-label="Cart items">
            <ul className="divide-y divide-zinc-200 rounded-2xl bg-white px-4 shadow-sm ring-1 ring-zinc-200 sm:px-6">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-6 sm:gap-5">
                  <Link
                    href={`/products/${item.productId}`}
                    className="relative size-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-zinc-200 transition hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:size-24"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.productId}`}
                          className="line-clamp-1 font-medium text-zinc-900 transition hover:text-brand-700"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-sm text-zinc-500 tabular-nums">
                          {formatPrice(item.priceCents)} each
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="grid size-9 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
                      >
                        <Trash2 aria-hidden="true" className="size-4.5" />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                      <QuantityStepper
                        value={item.quantity}
                        max={item.maxQuantity}
                        onChange={(next) => setQuantity(item.productId, next)}
                        label="Quantity"
                        size="sm"
                      />
                      <p className="font-bold tabular-nums text-zinc-900">
                        {formatPrice(item.priceCents * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside aria-label="Order summary" className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
              <h2 className="text-lg font-bold text-zinc-900">Order summary</h2>

              <dl className="mt-5 space-y-3 text-sm">
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
                <div
                  className="border-t border-zinc-200 pt-4"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex justify-between text-base">
                    <dt className="font-bold text-zinc-900">Total</dt>
                    <dd className="font-extrabold tabular-nums text-zinc-950">
                      {formatPrice(totals.totalCents)}
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="mt-5 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                {remainingForFreeShipping > 0 ? (
                  <>
                    <p className="text-xs leading-5 text-zinc-600">
                      You’re{" "}
                      <strong className="tabular-nums text-zinc-900">
                        {formatPrice(remainingForFreeShipping)}
                      </strong>{" "}
                      away from free shipping.
                    </p>
                    <div
                      role="progressbar"
                      aria-valuenow={Math.round(freeShippingProgress)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Progress towards free shipping"
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200"
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500"
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-semibold text-emerald-600">
                    🎉 You’ve unlocked free shipping on this order!
                  </p>
                )}
              </div>

              <Link href="/checkout" className={`${btnPrimary} mt-6 w-full`}>
                Proceed to checkout
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/products"
                className="mt-3 block w-full rounded-full py-2.5 text-center text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                Continue shopping
              </Link>

              <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                <ShieldCheck aria-hidden="true" className="size-3.5" />
                Simulated checkout — no payment is processed
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
