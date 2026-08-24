import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryGradients, categoryIcons } from "@/lib/category-icons";
import { categories, getCategoryCounts } from "@/lib/data";
import { containerClass } from "@/lib/ui";

export function CategoryGrid() {
  const counts = getCategoryCounts();

  return (
    <section className={containerClass} aria-labelledby="categories-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="categories-heading"
            className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl"
          >
            Shop by category
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500 sm:text-base">
            Eight curated departments, zero endless scrolling.
          </p>
        </div>
        <Link
          href="/categories"
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 transition hover:text-brand-800 sm:inline-flex"
        >
          View all
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id];
          return (
            <li key={category.id}>
              <Link
                href={`/products?category=${category.id}`}
                className="group flex h-full flex-col rounded-2xl bg-white p-5 ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <span
                  className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${categoryGradients[category.id]}`}
                >
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <span className="mt-4 flex items-center justify-between gap-2">
                  <span className="font-semibold text-zinc-900">{category.name}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-zinc-300 transition group-hover:text-brand-600"
                  />
                </span>
                <span className="mt-0.5 text-xs text-zinc-500">
                  {counts[category.id]} products
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
