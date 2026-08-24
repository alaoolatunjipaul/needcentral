"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface QuickAddButtonProps {
  product: Product;
  className?: string;
}

export function QuickAddButton({ product, className }: QuickAddButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    addItem(product);
    setAdded(true);
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`${added ? "Added" : "Add"} ${product.name} to cart`}
      className={cn(
        "grid size-10 place-items-center rounded-full bg-white text-zinc-700 shadow-md ring-1 ring-zinc-200 transition-all duration-200 hover:scale-105 hover:bg-brand-600 hover:text-white hover:ring-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-95",
        added && "bg-emerald-500 text-white ring-emerald-500",
        className
      )}
    >
      {added ? (
        <Check aria-hidden="true" className="size-5" />
      ) : (
        <Plus aria-hidden="true" className="size-5" />
      )}
    </button>
  );
}
