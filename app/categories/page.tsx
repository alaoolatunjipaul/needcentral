import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryGradients, categoryIcons } from "@/lib/category-icons";
import { categories, getCategoryCounts } from "@/lib/data";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Browse categories",
  description:
    "Explore all Vendora categories — audio, mobile, computers, wearables, photography, gaming, home & living and fitness. Find the department that fits what you need.",
};

export default function CategoriesPage() {
  const counts = getCategoryCounts();

  return (
    <div className={containerClass}>
      <header className="py-8 lg:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
          Browse categories
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
          Eight curated departments covering everything from headphones to
          dumbbells. Pick a lane and start exploring.
        </p>
      </header>

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
