import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}

export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
  className,
}: RatingStarsProps) {
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100));
  const starClass = cn(
    "shrink-0 fill-current",
    size === "sm" ? "size-3.5" : "size-5"
  );

  const stars = Array.from({ length: 5 }, (_, index) => (
    <Star key={index} aria-hidden="true" className={starClass} />
  ));

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Rated ${rating} out of 5${
        reviewCount === undefined ? "" : ` based on ${reviewCount} reviews`
      }`}
    >
      <div className="relative inline-flex">
        <div className="flex gap-0.5 text-zinc-300">{stars}</div>
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          <div className="flex w-max gap-0.5 text-amber-400">{stars}</div>
        </div>
      </div>
      {reviewCount !== undefined && (
        <span
          className={cn(
            "tabular-nums text-zinc-500",
            size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          {rating.toFixed(1)} ({reviewCount.toLocaleString("en-US")})
        </span>
      )}
    </div>
  );
}
