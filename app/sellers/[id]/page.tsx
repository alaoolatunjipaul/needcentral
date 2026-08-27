import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { ProductGrid } from "@/components/products/ProductCard";
import { getSellerById, getSellerProducts, getSellerSummaries } from "@/lib/data";
import { containerClass } from "@/lib/ui";

interface SellerPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams(): Array<{ id: string }> {
  return getSellerSummaries().map((summary) => ({ id: summary.seller.id }));
}

/**
 * Every storefront is prerendered at build time, so any other id is truly
 * not found — served as a real HTTP 404 instead of a streamed fallback.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: SellerPageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = getSellerById(id);
  if (!seller) {
    return { title: "Seller not found" };
  }
  return {
    title: `${seller.name} · Seller storefront`,
    description: seller.description,
    openGraph: {
      title: `${seller.name} on NeedCentral`,
      description: seller.description,
    },
  };
}

export default async function SellerStorefrontPage({ params }: SellerPageProps) {
  const { id } = await params;
  const seller = getSellerById(id);
  if (!seller) notFound();

  const products = getSellerProducts(seller.id);
  const reviewCount = products.reduce((sum, product) => sum + product.reviewCount, 0);
  const avgRating = products.length
    ? products.reduce((sum, product) => sum + product.rating, 0) / products.length
    : 0;
  const africanMadeCount = products.filter(
    (product) => product.origin?.madeInAfrica
  ).length;

  return (
    <div className={containerClass}>
      <nav aria-label="Breadcrumb" className="pt-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
          <li>
            <Link href="/" className="transition hover:text-brand-700">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 text-zinc-400" />
          </li>
          <li>
            <Link href="/sellers" className="transition hover:text-brand-700">
              Sellers
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 text-zinc-400" />
          </li>
          <li aria-current="page" className="max-w-[16rem] truncate font-medium text-zinc-900">
            {seller.name}
          </li>
        </ol>
      </nav>

      <header className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <span
            aria-hidden="true"
            className="grid size-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-brand-600 to-violet-500 text-3xl font-extrabold text-white shadow-md"
          >
            {seller.name.slice(0, 1)}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">
              {seller.name}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <BadgeCheck aria-hidden="true" className="size-4" />
                Verified seller since {seller.joinedYear}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="size-4 shrink-0" />
                {seller.location}
              </span>
            </p>
            <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
              {seller.description}
            </p>

            {africanMadeCount > 0 && (
              <Link
                href="/products?collection=african-made"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                <Sparkles aria-hidden="true" className="size-3.5" />
                {africanMadeCount} African-made product{africanMadeCount === 1 ? "" : "s"} in this store
              </Link>
            )}
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-zinc-200 pt-6 sm:grid-cols-3 lg:grid-cols-4">
          <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Products
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-zinc-900">
              {products.length}
            </dd>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Avg. product rating
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-xl font-bold tabular-nums text-zinc-900">
              <Star aria-hidden="true" className="size-5 fill-amber-400 text-amber-400" />
              {avgRating.toFixed(1)}
            </dd>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Customer reviews
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-zinc-900">
              {reviewCount.toLocaleString("en-US")}
            </dd>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200 sm:col-span-3 lg:col-span-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              On NeedCentral since
            </dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-zinc-900">
              {seller.joinedYear}
            </dd>
          </div>
        </dl>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        <li className="flex items-start gap-2.5 rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
          <Truck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <span className="text-sm leading-5 text-zinc-600">
            Free standard delivery on orders over ₦75,000
          </span>
        </li>
        <li className="flex items-start gap-2.5 rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
          <RotateCcw aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <span className="text-sm leading-5 text-zinc-600">
            Free 30-day returns on this store
          </span>
        </li>
        <li className="flex items-start gap-2.5 rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <span className="text-sm leading-5 text-zinc-600">
            NeedCentral buyer protection on every order
          </span>
        </li>
      </ul>

      <section aria-labelledby="storefront-products-heading" className="py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="storefront-products-heading"
              className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl"
            >
              Products from this store
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500 sm:text-base">
              Everything {seller.name} currently lists on the marketplace.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 transition hover:text-brand-800 sm:inline-flex"
          >
            Browse full catalogue
          </Link>
        </div>
        <div className="mt-7 pb-4">
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
              This store has no listings right now — check back soon.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
