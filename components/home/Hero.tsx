import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RotateCcw, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { getProductById } from "@/lib/data";
import { btnPrimary, btnSecondary } from "@/lib/ui";

const HERO_PRODUCT_ID = "pulse-anc-headphones";

export function Hero() {
  const heroProduct = getProductById(HERO_PRODUCT_ID);

  return (
    <section className="relative overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-brand-200/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-violet-200/40 blur-3xl"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
            <Sparkles aria-hidden="true" className="size-3.5" />
            Born in Nigeria · open to the world
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            A global marketplace,{" "}
            <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
              born in Nigeria
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">
            Shop electronics, fashion, food and African-made goods from
            individuals, small businesses, brands and creators — with honest
            reviews, fast delivery and effortless returns.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className={btnPrimary}>
              Start shopping
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link href="/products?collection=african-made" className={btnSecondary}>
              Explore African made
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-zinc-200 rounded-2xl border border-zinc-200 bg-zinc-50/70 py-4 text-center">
            <div className="px-3">
              <dt className="order-2 mt-0.5 text-xs font-medium text-zinc-500">
                Average rating
              </dt>
              <dd className="flex items-center justify-center gap-1 text-lg font-bold tabular-nums text-zinc-900">
                4.8
                <Star aria-hidden="true" className="size-4 fill-amber-400 text-amber-400" />
              </dd>
            </div>
            <div className="px-3">
              <dt className="order-2 mt-0.5 text-xs font-medium text-zinc-500">
                Happy customers
              </dt>
              <dd className="text-lg font-bold tabular-nums text-zinc-900">12k+</dd>
            </div>
            <div className="px-3">
              <dt className="order-2 mt-0.5 text-xs font-medium text-zinc-500">
                Free delivery
              </dt>
              <dd className="whitespace-nowrap text-lg font-bold tabular-nums text-zinc-900">₦75k+</dd>
            </div>
          </dl>
        </div>

        {heroProduct && (
          <div className="relative mx-auto w-full max-w-md animate-fade-in lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute inset-6 rotate-3 rounded-[2rem] bg-gradient-to-br from-brand-100 to-violet-100"
            />
            <Link
              href={`/products/${heroProduct.id}`}
              className="group relative block aspect-square overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-zinc-900/5 transition hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
            >
              <Image
                src={heroProduct.image}
                alt={heroProduct.name}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, (min-width: 640px) 60vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </Link>

            <div className="absolute -left-3 bottom-8 flex items-center gap-3 rounded-2xl bg-white/95 p-3 pr-5 shadow-lg ring-1 ring-zinc-200 backdrop-blur sm:-left-6">
              <span className="grid size-11 place-items-center rounded-xl bg-amber-100">
                <Star aria-hidden="true" className="size-5 fill-amber-500 text-amber-500" />
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-900">{heroProduct.rating.toFixed(1)} / 5</p>
                <p className="text-xs text-zinc-500">
                  {heroProduct.reviewCount.toLocaleString("en-US")} reviews
                </p>
              </div>
            </div>

            <div className="absolute -right-2 top-8 hidden rounded-2xl bg-zinc-900/90 px-4 py-3 text-white shadow-lg backdrop-blur sm:block">
              <p className="text-xs uppercase tracking-wide text-zinc-300">Today only</p>
              <p className="text-lg font-bold tracking-tight">Save 20%</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-100">
        <ul className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-sm font-medium text-zinc-500 sm:justify-between sm:px-6 lg:px-8">
          <li className="flex items-center gap-2">
            <Truck aria-hidden="true" className="size-4 text-brand-600" />
            Free standard delivery over ₦75,000
          </li>
          <li className="flex items-center gap-2">
            <RotateCcw aria-hidden="true" className="size-4 text-brand-600" />
            30-day free returns
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="size-4 text-brand-600" />
            Buyer protection on every order
          </li>
        </ul>
      </div>
    </section>
  );
}
