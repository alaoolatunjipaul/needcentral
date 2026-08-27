"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, History } from "lucide-react";
import { useRecentlyViewed } from "@/components/products/RecentlyViewedProvider";
import { RatingStars } from "@/components/products/RatingStars";
import { getProductById } from "@/lib/data";
import { cn, formatPrice } from "@/lib/utils";

interface RecentlyViewedRailProps {
  /** Current product id — hidden from the rail so a page never links to itself. */
  excludeId?: string;
  /**
   * When true, an empty history renders a "Continue browsing" prompt instead
   * of nothing (used on the home page). Everywhere else the rail stays
   * invisible until the customer has actually viewed something.
   */
  showFallback?: boolean;
  className?: string;
}

/**
 * Horizontal rail of the customer's most recently viewed products, newest
 * first. Rendered fully client-side from localStorage; server HTML renders
 * nothing so there is never an awkward empty shell.
 */
export function RecentlyViewedRail({
  excludeId,
  showFallback = false,
  className,
}: RecentlyViewedRailProps) {
  const { recentlyViewedIds, clearRecentlyViewed } = useRecentlyViewed();

  const products = recentlyViewedIds
    .filter((id) => id !== excludeId)
    .map((id) => getProductById(id))
    .filter((product) => product !== undefined);

  if (products.length === 0) {
    if (!showFallback) return null;

    return (
      <section aria-labelledby="continue-browsing-heading" className={className}>
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed border-zinc-300 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100"
            >
              <Compass className="size-5" />
            </span>
            <div>
              <h2
                id="continue-browsing-heading"
                className="text-lg font-bold text-zinc-950"
              >
                Continue browsing
              </h2>
              <p className="mt-0.5 max-w-md text-sm leading-6 text-zinc-500">
                Products you look at will appear here, so you can always jump
                back in — right where you left off.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              Browse all products
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
            <Link
              href="/products?collection=african-made"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Explore African made
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="recently-viewed-heading" className={className}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <History aria-hidden="true" className="size-3.5" />
            Welcome back
          </p>
          <h2
            id="recently-viewed-heading"
            className="mt-1.5 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl"
          >
            Recently viewed
          </h2>
        </div>
        <button
          type="button"
          onClick={clearRecentlyViewed}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Clear history
        </button>
      </div>

      <div
        role="region"
        aria-label="Recently viewed products, scrollable list"
        tabIndex={0}
        className={cn(
          "mt-6 overflow-x-auto pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 [scrollbar-width:thin]"
        )}
      >
        <ul className="flex w-max gap-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="w-40 shrink-0 snap-start sm:w-48"
            >
              <Link
                href={`/products/${product.id}`}
                className="group block rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="192px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-2.5 line-clamp-2 min-h-10 text-sm font-medium leading-5 text-zinc-900 transition group-hover:text-brand-700">
                  {product.name}
                </h3>
                <RatingStars rating={product.rating} className="mt-1" />
                <p className="mt-1.5 text-sm font-bold tabular-nums text-zinc-950">
                  {formatPrice(product.priceCents)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
