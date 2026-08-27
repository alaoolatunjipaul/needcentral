import Link from "next/link";
import { BadgeCheck, MapPin, Sparkles, Star } from "lucide-react";
import type { SellerSummary } from "@/types";

interface SellerCardProps {
  summary: SellerSummary;
}

export function SellerCard({ summary }: SellerCardProps) {
  const { seller, productCount, avgRating, reviewCount, africanMadeCount } =
    summary;

  return (
    <Link
      href={`/sellers/${seller.id}`}
      className="group flex h-full flex-col rounded-3xl bg-white p-6 ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-500 text-xl font-extrabold text-white shadow-sm"
        >
          {seller.name.slice(0, 1)}
        </span>
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-full bg-emerald-50 text-emerald-600"
          title="Verified seller"
        >
          <BadgeCheck className="size-5" />
        </span>
      </div>

      <h3 className="mt-4 font-semibold text-zinc-900 transition group-hover:text-brand-700">
        {seller.name}
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
        <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
        {seller.location}
      </p>

      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-zinc-500">
        {seller.description}
      </p>

      {africanMadeCount > 0 && (
        <p className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <Sparkles aria-hidden="true" className="size-3" />
            African-made store
          </span>
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-500">
        <span className="font-medium tabular-nums text-zinc-700">
          {productCount} product{productCount === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <Star aria-hidden="true" className="size-3.5 fill-amber-400 text-amber-400" />
          {avgRating.toFixed(1)} · {reviewCount.toLocaleString("en-US")} reviews
        </span>
      </div>
    </Link>
  );
}
