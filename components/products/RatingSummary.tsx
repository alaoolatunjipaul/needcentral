import { RatingStars } from "@/components/products/RatingStars";
import type { RatingDistribution } from "@/types";
import { cn } from "@/lib/utils";

interface RatingSummaryProps {
  rating: number;
  reviewCount: number;
  ratingDistribution?: RatingDistribution[];
  className?: string;
}

/**
 * Overall rating panel for the product page: big score, stars and total
 * count, plus a per-star breakdown when verified distribution data exists.
 * The breakdown is never invented — products without one show a note
 * instead, keeping the interface ready for real review data later.
 */
export function RatingSummary({
  rating,
  reviewCount,
  ratingDistribution,
  className,
}: RatingSummaryProps) {
  const distribution =
    ratingDistribution !== undefined && ratingDistribution.length === 5
      ? [...ratingDistribution].sort((a, b) => b.stars - a.stars)
      : undefined;
  const distributionTotal = distribution?.reduce(
    (sum, entry) => sum + entry.count,
    0
  );

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <p
          aria-hidden="true"
          className="text-5xl font-extrabold tabular-nums tracking-tight text-zinc-950"
        >
          {rating.toFixed(1)}
        </p>
        <div>
          <RatingStars rating={rating} size="md" />
          <p className="mt-1 text-sm text-zinc-500 tabular-nums">
            {reviewCount.toLocaleString("en-US")}{" "}
            {reviewCount === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {distribution && distributionTotal ? (
        <dl className="mt-5 space-y-2 border-t border-zinc-200 pt-5">
          {distribution.map((entry) => {
            const percent = Math.round((entry.count / distributionTotal) * 100);
            return (
              <div key={entry.stars} className="flex items-center gap-2.5 text-xs">
                <dt className="flex w-14 shrink-0 items-center gap-1 font-semibold text-zinc-600">
                  {entry.stars}
                  <span aria-hidden="true" className="text-amber-500">
                    ★
                  </span>
                  <span className="sr-only">star</span>
                </dt>
                <dd className="flex flex-1 items-center gap-2.5">
                  <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-amber-400"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right font-medium tabular-nums text-zinc-500">
                    {percent}%
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <p className="mt-5 border-t border-zinc-200 pt-5 text-xs leading-5 text-zinc-400">
          A star-by-star breakdown appears once enough verified reviews are
          collected for this product.
        </p>
      )}
    </div>
  );
}
