import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { DealBanner } from "@/components/home/DealBanner";
import { Hero } from "@/components/home/Hero";
import { Newsletter } from "@/components/home/Newsletter";
import { ProductGrid } from "@/components/products/ProductCard";
import { RecentlyViewedRail } from "@/components/products/RecentlyViewedRail";
import {
  countAfricanMadeProducts,
  getAfricanMadeProducts,
  getFeaturedProducts,
  getTrendingProducts,
} from "@/lib/data";
import { containerClass } from "@/lib/ui";

export default function HomePage() {
  const featuredProducts = getFeaturedProducts(8);
  const trendingProducts = getTrendingProducts(8);
  const africanMade = getAfricanMadeProducts();
  const africanMadeCount = countAfricanMadeProducts();

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

      <section className={containerClass} aria-labelledby="african-made-heading">
        <div className="flex flex-col gap-6 rounded-3xl bg-emerald-50/60 p-6 ring-1 ring-emerald-100 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Nigerian / African Made
            </p>
            <h2
              id="african-made-heading"
              className="mt-4 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl"
            >
              Crafted on the continent
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-base">
              From hand-dyed Adire in Lagos to shea butter co-operatives and
              Kano farm produce — meet the makers behind {africanMadeCount}+
              African products, a signature part of our global catalogue.
            </p>
          </div>
          <Link
            href="/products?collection=african-made"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Shop African made
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="mt-7">
          <ProductGrid products={africanMade.slice(0, 8)} />
        </div>
      </section>

      <section className={containerClass} aria-labelledby="trending-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              id="trending-heading"
              className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl"
            >
              Trending now
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500 sm:text-base">
              What shoppers in Lagos, Abuja and around the world are buying this week.
            </p>
          </div>
          <Link
            href="/products?sort=rating"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 transition hover:text-brand-800 sm:inline-flex"
          >
            View all
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="mt-7">
          <ProductGrid products={trendingProducts} />
        </div>
      </section>

      <RecentlyViewedRail showFallback className={containerClass} />

      <DealBanner />

      <Newsletter />
    </div>
  );
}
