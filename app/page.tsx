import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { DealBanner } from "@/components/home/DealBanner";
import { Hero } from "@/components/home/Hero";
import { Newsletter } from "@/components/home/Newsletter";
import { ProductGrid } from "@/components/products/ProductCard";
import { getFeaturedProducts } from "@/lib/data";
import { containerClass } from "@/lib/ui";

export default function HomePage() {
  const featuredProducts = getFeaturedProducts(8);

  return (
    <div className="flex flex-col gap-16 pb-20 sm:gap-20 lg:gap-24">
      <Hero />

      <CategoryGrid />

      <section className={containerClass} aria-labelledby="featured-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="featured-heading"
              className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl"
            >
              Featured products
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500 sm:text-base">
              Hand-picked favourites our customers keep coming back for.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 transition hover:text-brand-800 sm:inline-flex"
          >
            View all
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="mt-7">
          <ProductGrid products={featuredProducts} />
        </div>
        <div className="mt-9 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-300 transition hover:bg-zinc-50"
          >
            View all products
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>

      <DealBanner />

      <Newsletter />
    </div>
  );
}
