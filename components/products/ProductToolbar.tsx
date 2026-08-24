"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { ChevronDown, Search, SearchX, X } from "lucide-react";
import type { CategoryId, ProductQuery, SortOption } from "@/types";
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
  name: "Name A–Z",
};

interface ProductToolbarProps {
  query: ProductQuery;
  resultCount: number;
  categoryCounts: Record<CategoryId | "all", number>;
  categoryNames: Record<string, string>;
}

export function ProductToolbar({
  query,
  resultCount,
  categoryCounts,
  categoryNames,
}: ProductToolbarProps) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyUpdate = useCallback(
    (overrides: Partial<ProductQuery>, scroll = false) => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      const next: ProductQuery = { ...query, ...overrides };
      const params = new URLSearchParams();
      if (next.q) params.set("q", next.q);
      if (next.category !== "all") params.set("category", next.category);
      if (next.sort !== "featured") params.set("sort", next.sort);
      const queryString = params.toString();
      router.push(queryString ? `/products?${queryString}` : "/products", {
        scroll,
      });
    },
    [query, router]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, []);

  function scheduleSearch(value: string) {
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyUpdate({ q: value.trim() });
    }, 350);
  }

  const hasActiveFilters = query.category !== "all" || Boolean(query.q);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form
          role="search"
          className="relative flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            const input = event.currentTarget.elements.namedItem(
              "q"
            ) as HTMLInputElement;
            applyUpdate({ q: input.value.trim() }, true);
          }}
        >
          <label htmlFor="catalog-search" className="sr-only">
            Search products
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-zinc-400"
          />
          <input
            key={query.q}
            id="catalog-search"
            name="q"
            type="search"
            autoComplete="off"
            defaultValue={query.q}
            onChange={(event) => scheduleSearch(event.target.value)}
            placeholder="Search by name, category or description…"
            className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-11 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          {query.q && (
            <button
              type="button"
              onClick={() => applyUpdate({ q: "" })}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-3">
          <label htmlFor="catalog-sort" className="shrink-0 text-sm font-medium text-zinc-600">
            Sort
          </label>
          <div className="relative">
            <select
              id="catalog-sort"
              value={query.sort}
              onChange={(event) => applyUpdate({ sort: event.target.value as SortOption }, true)}
              className="w-full appearance-none rounded-xl border border-zinc-300 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-zinc-900 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                <option key={option} value={option}>
                  {SORT_LABELS[option]}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
            />
          </div>
        </div>
      </div>

      <nav aria-label="Filter by category">
        <ul className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["all", ...Object.keys(categoryNames)] as Array<CategoryId | "all">).map(
            (categoryId) => (
              <li key={categoryId} className="shrink-0">
                <button
                  type="button"
                  onClick={() => applyUpdate({ category: categoryId }, true)}
                  aria-pressed={query.category === categoryId}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
                    query.category === categoryId
                      ? "bg-brand-600 text-white ring-brand-600"
                      : "bg-white text-zinc-600 ring-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  {categoryId === "all" ? "All" : categoryNames[categoryId]}
                  <span
                    className={cn(
                      "ml-1.5 tabular-nums",
                      query.category === categoryId ? "text-indigo-200" : "text-zinc-400"
                    )}
                  >
                    {categoryCounts[categoryId]}
                  </span>
                </button>
              </li>
            )
          )}
        </ul>
      </nav>

      <p className="text-sm text-zinc-500" aria-live="polite">
        {resultCount === 0 ? (
          "No products match your filters."
        ) : (
          <>
            Showing <span className="font-semibold text-zinc-900">{resultCount}</span>{" "}
            product{resultCount === 1 ? "" : "s"}
            {query.category !== "all" && <> in {categoryNames[query.category]}</>}
            {query.q && (
              <>
                {" "}for “<span className="font-semibold text-zinc-900">{query.q}</span>”
              </>
            )}
          </>
        )}
        {hasActiveFilters && resultCount > 0 && (
          <>
            {" · "}
            <Link
              href="/products"
              className="font-semibold text-brand-700 underline-offset-2 transition hover:text-brand-800 hover:underline"
            >
              Clear filters
            </Link>
          </>
        )}
      </p>

      {resultCount === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-zinc-100 text-zinc-400">
            <SearchX aria-hidden="true" className="size-7" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-zinc-900">Nothing found</h3>
          <p className="mt-1 max-w-sm text-sm leading-6 text-zinc-500">
            Try a different search term or browse the full catalogue — new products land every week.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Clear all filters
          </Link>
        </div>
      )}
    </div>
  );
}
