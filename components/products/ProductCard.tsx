import Image from "next/image";
import Link from "next/link";
import { QuickAddButton } from "@/components/products/QuickAddButton";
import { RatingStars } from "@/components/products/RatingStars";
import { categories } from "@/lib/data";
import { cn, discountPercent, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

function originLabel(product: Product): string | null {
  if (!product.origin?.madeInAfrica) return null;
  return product.origin.countryCode === "NG"
    ? "Nigerian made"
    : `Made in ${product.origin.country}`;
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = discountPercent(product.priceCents, product.compareAtPriceCents);
  const outOfStock = product.stock <= 0;
  const madeIn = originLabel(product);

  return (
    <article className="group relative flex h-full flex-col">
      <Link
        href={`/products/${product.id}`}
        className="flex h-full flex-col rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
      >
        <div
          className={cn(
            "relative aspect-square overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:ring-brand-300"
          )}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {discount !== null && (
            <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-x-0 bottom-0 bg-zinc-900/70 py-2 text-center text-sm font-medium text-white backdrop-blur-sm">
              Out of stock
            </div>
          )}
        </div>

        <div className="mt-3.5 flex flex-1 flex-col gap-1.5 px-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600/80">
            {categoryNameById.get(product.category)}
          </p>
          <h3 className="line-clamp-1 font-medium text-zinc-900 transition group-hover:text-brand-700">
            {product.name}
          </h3>
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
          {madeIn && (
            <p className="text-[11px] font-medium text-emerald-700">{madeIn}</p>
          )}
          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-lg font-bold tracking-tight text-zinc-900">
              {formatPrice(product.priceCents)}
            </span>
            {product.compareAtPriceCents !== undefined && (
              <span className="text-sm text-zinc-400 line-through">
                {formatPrice(product.compareAtPriceCents)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {!outOfStock && (
        <QuickAddButton product={product} className="absolute right-3 top-3 opacity-0 transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100 sm:opacity-100" />
      )}
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id} className="animate-fade-up">
          <ProductCard product={product} priority={index < 4} />
        </li>
      ))}
    </ul>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="aspect-square animate-pulse rounded-2xl bg-zinc-200" />
      <div className="h-3 w-16 animate-pulse rounded-full bg-zinc-200" />
      <div className="h-4 w-3/4 animate-pulse rounded-full bg-zinc-200" />
      <div className="h-3 w-1/2 animate-pulse rounded-full bg-zinc-200" />
      <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-200" />
    </div>
  );
}
