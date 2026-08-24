import { ProductCardSkeleton } from "@/components/products/ProductCard";

export default function ProductsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-busy="true" aria-label="Loading products">
      <div className="h-9 w-56 animate-pulse rounded-xl bg-zinc-200" />
      <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded-full bg-zinc-200" />
      <div className="mt-8 h-11 animate-pulse rounded-xl bg-zinc-200" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-zinc-200" />
        ))}
      </div>
      <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
