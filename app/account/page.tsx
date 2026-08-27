"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ClipboardList,
  Heart,
  LogOut,
  LogIn,
  Mail,
  ShoppingBag,
  User,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useOrders } from "@/components/orders/OrdersProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { btnPrimary, btnSecondary, containerClass } from "@/lib/ui";

export default function AccountPage() {
  const router = useRouter();
  const { customer, isAuthenticated, signOut } = useAuth();
  const { itemCount } = useCart();
  const { count: savedCount } = useWishlist();
  const { orders } = useOrders();

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  if (!isAuthenticated || !customer) {
    return (
      <div className={containerClass}>
        <div className="mx-auto max-w-md py-16 sm:py-24">
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <span
              aria-hidden="true"
              className="grid size-16 place-items-center rounded-full bg-zinc-100 text-zinc-400"
            >
              <LogIn className="size-8" />
            </span>
            <h1 className="mt-5 text-xl font-bold text-zinc-900">
              Sign in to your account
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              View your profile, track orders and manage saved items — all in
              one place.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/signin" className={btnPrimary}>
                Sign in
              </Link>
              <Link href="/signup" className={btnSecondary}>
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <header className="py-8 lg:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
          Your account
        </h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base">
          Manage your profile, review orders and keep track of saved items.
        </p>
      </header>

      <div className="grid gap-6 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile card */}
        <section
          aria-labelledby="profile-heading"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 sm:col-span-2 lg:col-span-1"
        >
          <h2
            id="profile-heading"
            className="text-lg font-bold text-zinc-950"
          >
            Profile
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100"
              >
                <User className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-zinc-900">
                  {customer.name}
                </p>
                <p className="flex items-center gap-1.5 truncate text-sm text-zinc-500">
                  <Mail aria-hidden="true" className="size-3.5" />
                  {customer.email}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 border-t border-zinc-100 pt-5">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sign out
            </button>
          </div>
        </section>

        {/* Quick stats */}
        <section
          aria-labelledby="overview-heading"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
        >
          <h2
            id="overview-heading"
            className="text-lg font-bold text-zinc-950"
          >
            Overview
          </h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                href="/orders"
                className="flex items-center justify-between rounded-xl p-3 transition hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600"
                  >
                    <ClipboardList className="size-4.5" />
                  </span>
                  <span className="text-sm font-medium text-zinc-900">
                    Orders
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-zinc-600">
                    {orders.length}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 text-zinc-400"
                  />
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/wishlist"
                className="flex items-center justify-between rounded-xl p-3 transition hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-9 place-items-center rounded-lg bg-rose-50 text-rose-600"
                  >
                    <Heart className="size-4.5" />
                  </span>
                  <span className="text-sm font-medium text-zinc-900">
                    Saved items
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-zinc-600">
                    {savedCount}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 text-zinc-400"
                  />
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="flex items-center justify-between rounded-xl p-3 transition hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-600"
                  >
                    <ShoppingBag className="size-4.5" />
                  </span>
                  <span className="text-sm font-medium text-zinc-900">
                    Cart
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-zinc-600">
                    {itemCount}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 text-zinc-400"
                  />
                </span>
              </Link>
            </li>
          </ul>
        </section>

        {/* Quick actions */}
        <section
          aria-labelledby="actions-heading"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
        >
          <h2
            id="actions-heading"
            className="text-lg font-bold text-zinc-950"
          >
            Quick actions
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/products"
              className={btnSecondary}
            >
              Continue shopping
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/products?collection=african-made"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Explore African made
            </Link>
          </div>
          <p className="mt-5 text-xs leading-5 text-zinc-400">
            This is a simulated customer account. No real data is stored or
            transmitted — everything lives in your browser&apos;s localStorage.
          </p>
        </section>
      </div>
    </div>
  );
}
