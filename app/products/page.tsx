import type { Metadata } from "next";
import { ProductGrid } from "@/components/products/ProductCard";
import { ProductToolbar } from "@/components/products/ProductToolbar";
import { RecentlyViewedRail } from "@/components/products/RecentlyViewedRail";
import { parseProductQuery } from "@/lib/data";
import { filterAndSortProducts, getAllCategories, getCategoryCounts } from "@/lib/queries";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Shop all products",
  description:
    "Browse the full NeedCentral catalogue — electronics, phones, computers, fashion, beauty, groceries, home and more. Filter by category, explore African-made goods, sort by price and find what you need.",
};

export const instant = false;

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const query = parseProductQuery(resolvedParams);
  const categories = await getAllCategories();
  const categoryNames = Object.fromEntries(
    categories.map((category) => [category.id, category.name])
  );
  const { items, total } = await filterAndSortProducts(query);
  const counts = await getCategoryCounts();

  return (
    <div className={containerClass}>
      <header className="py-8 lg:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
          Shop products
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
          Every product on the marketplace, in one place. Use search and filters
          to zero in on exactly what you need.
        </p>
      </header>

      <div className="pb-16">
        <ProductToolbar
          query={query}
          resultCount={total}
          categoryCounts={counts}
          categoryNames={categoryNames}
        />
        {total > 0 && (
          <div className="mt-6">
            <ProductGrid products={items} />
          </div>
        )}
      </div>

      <RecentlyViewedRail className="pb-16" />
    </div>
  );
}
