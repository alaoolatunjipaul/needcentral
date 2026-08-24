import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { AddToCartPanel } from "@/components/products/AddToCartPanel";
import { ProductGrid } from "@/components/products/ProductCard";
import { RatingStars } from "@/components/products/RatingStars";
import { categories, getAllProducts, getProductById, getRelatedProducts } from "@/lib/data";
import { containerClass } from "@/lib/ui";
import { discountPercent, formatPrice } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams(): Array<{ id: string }> {
  return getAllProducts().map((product) => ({ id: product.id }));
}

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
          <Link
            href={`/products?category=${product.category}`}
            className="inline-flex w-fit items-center rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-100"
          >
            {categoryName}
          </Link>

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

          <div className="mt-7">
            <AddToCartPanel product={product} />
          </div>

          <ul className="mt-9 grid gap-4 border-t border-zinc-200 pt-7 sm:grid-cols-3">
            <li className="flex items-start gap-2.5">
              <Truck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-600" />
              <span className="text-sm leading-5 text-zinc-600">
                Free shipping on orders over $75
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
                2-year warranty on all tech products
              </span>
            </li>
          </ul>
        </div>
      </div>

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
