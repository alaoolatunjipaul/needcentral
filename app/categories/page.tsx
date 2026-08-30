import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { categoryGradients, categoryIcons } from "@/lib/category-icons";
import { getAllCategories, getCategoryCounts } from "@/lib/queries";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Browse categories",
  description:
    "Explore every NeedCentral department — electronics, phones & accessories, computers, fashion, beauty, food & groceries, home, wellness and more. Plus the Nigerian / African Made collection.",
};

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([
    getAllCategories(),
    getCategoryCounts(),
  ]);

  return (
    <div className={containerClass}>
      <header className="py-8 lg:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
          Browse categories
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
          Fifteen departments covering everything from smartphones to shea
          butter. Pick a lane and start exploring.
        </p>
      </header>

      <Link
        href="/products?collection=african-made"
        className="group mb-5 flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-500 p-6 text-white shadow-sm transition hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-white/25">
            <Sparkles aria-hidden="true" className="size-3.5" />
            Collection
          </p>
          <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
            Nigerian / African Made
          </h2>
          <p className="mt-1 max-w-lg text-sm leading-6 text-emerald-50">
            Fashion, skincare, food and crafts designed, farmed or crafted on
            the continent — a signature collection in a marketplace open to the world.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition group-hover:bg-emerald-50">
          Shop the collection
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </span>
      </Link>

      <ul className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id];
          return (
            <li key={category.id}>
              <Link
                href={`/products?category=${category.id}`}
                className="group flex h-full flex-col rounded-3xl bg-white p-6 ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <span
                  className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-sm ${categoryGradients[category.id]}`}
                >
                  <Icon aria-hidden="true" className="size-7" />
                </span>
                <span className="mt-5 flex items-center justify-between gap-2">
                  <span className="text-lg font-semibold text-zinc-900">
                    {category.name}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-zinc-300 transition group-hover:text-brand-600"
                  />
                </span>
                <span className="mt-1 text-sm leading-6 text-zinc-500">
                  {category.tagline}
                </span>
                <span className="mt-auto pt-4 text-sm font-medium tabular-nums text-brand-700">
                  {counts[category.id]} products →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
