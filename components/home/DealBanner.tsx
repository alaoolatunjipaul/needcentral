import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { getProductById, promotions } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export function DealBanner() {
  const promotion = promotions[0];
  const deal = promotion ? getProductById(promotion.productId) : undefined;
  if (!deal) return null;
  const badge = promotion?.badge ?? "Limited-time deal";

  const savingsCents =
    deal.compareAtPriceCents !== undefined
      ? deal.compareAtPriceCents - deal.priceCents
      : 0;

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="deal-heading"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 shadow-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl"
        />
        <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:p-14">
          <div className="text-white">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-white/25 backdrop-blur">
              <Flame aria-hidden="true" className="size-3.5" />
              {badge}
            </p>
            <h2
              id="deal-heading"
              className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              {deal.name}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-indigo-100 sm:text-base">
              {deal.description}
            </p>
            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-extrabold tracking-tight">
                {formatPrice(deal.priceCents)}
              </span>
              {deal.compareAtPriceCents !== undefined && (
                <span className="text-lg text-indigo-200 line-through">
                  {formatPrice(deal.compareAtPriceCents)}
                </span>
              )}
              {savingsCents > 0 && (
                <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950">
                  Save {formatPrice(savingsCents)}
                </span>
              )}
            </div>
            <Link
              href={`/products/${deal.id}`}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-sm transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98]"
            >
              Grab the deal
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <Link
            href={`/products/${deal.id}`}
            className="group relative mx-auto block aspect-square w-full max-w-sm overflow-hidden rounded-2xl ring-1 ring-white/30 transition hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Image
              src={deal.image}
              alt={deal.name}
              fill
              sizes="(min-width: 1024px) 30vw, 80vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
