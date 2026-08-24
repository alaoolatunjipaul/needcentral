import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { AddToCartPanel } from "@/components/products/AddToCartPanel";
import { ProductGrid } from "@/components/products/ProductCard";
import { RatingStars } from "@/components/products/RatingStars";
import {
  categories,
  getAllProducts,
  getProductById,
  getRelatedProducts,
  getReviewsForProduct,
  getSellerById,
} from "@/lib/data";
import { containerClass } from "@/lib/ui";
import { discountPercent, formatPrice } from "@/lib/utils";

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
  const reviews = getReviewsForProduct(product.id);

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
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
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
                </p>
              </div>
            </div>
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

      <section aria-labelledby="reviews-heading" className="border-t border-zinc-200 py-12">
        <h2 id="reviews-heading" className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
          Customer reviews
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
        </div>

        <ul className="mt-8 grid gap-4 lg:grid-cols-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
            >
              <RatingStars rating={review.rating} />
              <h3 className="mt-3 font-semibold text-zinc-900">{review.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-6 text-zinc-600">
                {review.body}
              </p>
              <p className="mt-4 flex flex-wrap items-center gap-x-2 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-600">{review.author}</span>
                {review.location && <span>{review.location}</span>}
                {review.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                    <BadgeCheck aria-hidden="true" className="size-3.5" />
                    Verified purchase
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs leading-5 text-zinc-400">
          Reviews are shown from recent verified NeedCentral orders. Full review
          history arrives with customer accounts.
        </p>
      </section>

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
    </div>
  );
}
