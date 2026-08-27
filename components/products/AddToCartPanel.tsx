"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, Heart, ShoppingBag, Zap } from "lucide-react";
import { QuantityStepper } from "@/components/products/QuantityStepper";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { btnSecondary } from "@/lib/ui";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface AddToCartPanelProps {
  product: Product;
}

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const { addItem } = useCart();
  const { isSaved, toggle } = useWishlist();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const outOfStock = product.stock <= 0;
  const maxQuantity = Math.min(product.stock, 10);
  const saved = isSaved(product.id);

  function handleAdd() {
    addItem(product, quantity);
    setJustAdded(true);
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustAdded(false), 1800);
  }

  function handleBuyNow() {
    addItem(product, quantity);
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          value={quantity}
          max={maxQuantity}
          onChange={setQuantity}
          disabled={outOfStock}
          label="Quantity"
        />
        <span className="text-sm text-zinc-500 tabular-nums">
          {product.stock > 10
            ? "In stock"
            : product.stock > 0
              ? `Only ${product.stock} left in stock`
              : "Out of stock"}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
            justAdded
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          {justAdded ? (
            <>
              <Check aria-hidden="true" className="size-4" />
              Added to cart
            </>
          ) : (
            <>
              <ShoppingBag aria-hidden="true" className="size-4" />
              Add to cart
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className={`${btnSecondary} sm:w-auto`}
        >
          <Zap aria-hidden="true" className="size-4 text-amber-500" />
          Buy now
        </button>
        <button
          type="button"
          onClick={() => toggle(product)}
          aria-pressed={saved}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98]",
            saved
              ? "bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100"
              : "bg-white text-zinc-900 ring-zinc-300 hover:bg-zinc-50 hover:ring-zinc-400"
          )}
        >
          <Heart
            aria-hidden="true"
            className={cn("size-4", saved && "fill-rose-500 text-rose-500")}
          />
          {saved ? "Saved" : "Save for later"}
        </button>
      </div>
    </div>
  );
}
