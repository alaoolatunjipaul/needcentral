import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { AddToCartPanel } from "@/components/products/AddToCartPanel";
import { ProductGrid } from "@/components/products/ProductCard";
import { ProductQandA } from "@/components/products/ProductQandA";
import { ProductReviews } from "@/components/products/ProductReviews";
import { RatingStars } from "@/components/products/RatingStars";
import { RecentlyViewedRail } from "@/components/products/RecentlyViewedRail";
import { RecordProductView } from "@/components/products/RecordProductView";
import {
  categories,
  getAllProducts,
  getProductById,
  getQandAForProduct,
  getRelatedProducts,
  getReviewsForProduct,
  getSellerById,
  getSellerSummary,
} from "@/lib/data";
import { containerClass } from "@/lib/ui";
import {
  discountPercent,
  formatPrice,
} from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams(): Array<{ id: string }> {
  return getAllProducts().map((product) => ({ id: product.id }));
}

/**
 * Every product id is prerendered at build time, so any other id is truly
 * not found — served as a real HTTP 404 instead of a streamed fallback.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) {
    return { title: "Product not found" };
  }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const relatedProducts = getRelatedProducts(product);
  const categoryName =
    categories.find((category) => category.id === product.category)?.name ??
    product.category;
  const discount = discountPercent(product.priceCents, product.compareAtPriceCents);
  const seller = product.sellerId ? getSellerById(product.sellerId) : undefined;
  const sellerSummary = seller ? getSellerSummary(seller.id) : undefined;
  const reviews = getReviewsForProduct(product.id);
  const questions = getQandAForProduct(product.id);

  return (
    <div className={containerClass}>
      <RecordProductView productId={product.id} />
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
            <Link href="/products" className="transition hover:text-brand-700">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 text-zinc-400" />
          </li>
          <li>
            <Link
              href={`/products?category=${product.category}`}
              className="transition hover:text-brand-700"
            >
              {categoryName}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 text-zinc-400" />
          </li>
          <li aria-current="page" className="max-w-[16rem] truncate font-medium text-zinc-900">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 py-8 lg:grid-cols-2 lg:gap-14 lg:py-10">
        <div className="relative aspect-square self-start overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          {discount !== null && (
            <span className="absolute left-4 top-4 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
              -{discount}% today
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/products?category=${product.category}`}
              className="inline-flex w-fit items-center rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-100"
            >
              {categoryName}
            </Link>
            {product.origin?.madeInAfrica && (
              <Link
                href="/products?collection=african-made"
                className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
              >
                <Sparkles aria-hidden="true" className="size-3" />
                {product.origin.countryCode === "NG"
                  ? "Nigerian made"
                  : `Made in ${product.origin.country}`}
              </Link>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
            <a
              href="#reviews-heading"
              className="mt-1 inline-block text-xs font-semibold text-zinc-500 underline decoration-zinc-300 underline-offset-4 transition hover:text-brand-700 hover:decoration-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              See customer reviews
            </a>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-extrabold tracking-tight text-zinc-950">
              {formatPrice(product.priceCents)}
            </span>
            {product.compareAtPriceCents !== undefined && (
              <span className="text-xl text-zinc-400 line-through">
                {formatPrice(product.compareAtPriceCents)}
              </span>
            )}
          </div>

          <p className="mt-5 leading-7 text-zinc-600">{product.description}</p>

          {seller && (
            <Link
              href={`/sellers/${seller.id}`}
              className="group/seller mt-6 flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200 transition hover:bg-white hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-500 text-sm font-extrabold text-white"
              >
                {seller.name.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
                  <Store aria-hidden="true" className="size-4 text-brand-600" />
                  Sold by {seller.name}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin aria-hidden="true" className="size-3" />
                    {seller.location}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <BadgeCheck aria-hidden="true" className="size-3 text-emerald-600" />
                    Verified seller since {seller.joinedYear}
                  </span>
                  {sellerSummary && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Star
                          aria-hidden="true"
                          className="size-3 fill-amber-400 text-amber-400"
                        />
                        {sellerSummary.avgRating.toFixed(1)} store rating
                      </span>
                    </>
                  )}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-300 transition group-hover/seller:bg-brand-50 group-hover/seller:text-brand-700 group-hover/seller:ring-brand-200">
                Visit store
                <ArrowRight aria-hidden="true" className="size-3" />
              </span>
            </Link>
          )}

          <div className="mt-7">
            <AddToCartPanel product={product} />
          </div>

          <ul className="mt-9 grid gap-4 border-t border-zinc-200 pt-7 sm:grid-cols-3">
            <li className="flex items-start gap-2.5">
              <Truck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
              <span className="text-sm leading-5 text-zinc-600">
                Free standard delivery on orders over ₦75,000
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <RotateCcw aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
              <span className="text-sm leading-5 text-zinc-600">
                Free 30-day returns, no questions asked
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
              <span className="text-sm leading-5 text-zinc-600">
                NeedCentral buyer protection on every order
              </span>
            </li>
          </ul>
        </div>
      </div>

      <ProductReviews
        productId={product.id}
        seedReviews={reviews}
        baseRating={product.rating}
        baseReviewCount={product.reviewCount}
      />

      <ProductQandA productId={product.id} seedQuestions={questions} />

      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-zinc-200 py-12">
          <h2 id="related-heading" className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
            You may also like
          </h2>
          <div className="mt-7 pb-4">
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}

      <RecentlyViewedRail excludeId={product.id} className="pb-16" />
    </div>
  );
}
