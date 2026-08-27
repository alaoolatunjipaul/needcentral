"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export function WishlistButton({ product, className }: WishlistButtonProps) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(product.id);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(product);
      }}
      aria-pressed={saved}
      aria-label={
        saved
          ? `Remove ${product.name} from saved items`
          : `Save ${product.name} for later`
      }
      className={cn(
        "grid size-10 place-items-center rounded-full bg-white shadow-md ring-1 ring-zinc-200 transition-all duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-95",
        saved
          ? "text-rose-500 ring-rose-200"
          : "text-zinc-700 hover:text-rose-500 hover:ring-rose-300",
        className
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn("size-5 transition-colors", saved && "fill-rose-500")}
      />
    </button>
  );
}
