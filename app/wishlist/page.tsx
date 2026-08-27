"use client";

import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { ProductGrid } from "@/components/products/ProductCard";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { getProductById } from "@/lib/data";
import { btnPrimary, containerClass } from "@/lib/ui";

export default function WishlistPage() {
  const { items, count, clearWishlist } = useWishlist();
  const isEmpty = count === 0;

  const savedProducts = items.flatMap((item) => {
    const product = getProductById(item.productId);
    return product ? [product] : [];
  });

  return (
    <div className={containerClass}>
      <header className="py-8 lg:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
          Saved items
        </h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base" aria-live="polite">
          {isEmpty
            ? "Tap the heart on any product to keep it here for later."
            : `${count} item${count === 1 ? "" : "s"} you’re keeping an eye on.`}
        </p>
      </header>

      {isEmpty ? (
        <div className="mb-16 flex flex-col items-center rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-rose-50 text-rose-400">
            <Heart aria-hidden="true" className="size-8" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-zinc-900">
            Nothing saved yet
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            Browse the marketplace and save anything that catches your eye —
            your list stays on this device, ready whenever you are.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className={btnPrimary}>
              Browse products
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/products?collection=african-made"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-300 transition hover:bg-zinc-50 hover:ring-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98]"
            >
              Explore African made
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 pb-8">
            <p className="flex items-center gap-2 text-sm text-zinc-500">
              <ShoppingBag aria-hidden="true" className="size-4 text-brand-600" />
              Ready when you are — add any item to your cart straight from here.
            </p>
            <button
              type="button"
              onClick={clearWishlist}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-zinc-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            >
              Clear all
            </button>
          </div>
          <div className="pb-16">
            <ProductGrid products={savedProducts} />
          </div>
        </>
      )}
    </div>
  );
}
