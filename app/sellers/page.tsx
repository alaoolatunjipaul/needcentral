import type { Metadata } from "next";
import { Store } from "lucide-react";
import { SellerCard } from "@/components/sellers/SellerCard";
import { getSellerSummaries } from "@/lib/queries";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Our sellers",
  description:
    "Meet the people, studios and businesses behind NeedCentral — artisans and farms from Nigeria and Ghana alongside brands and studios from around the world.",
};

export const instant = false;

export default async function SellersPage() {
  const summaries = await getSellerSummaries();

  return (
    <div className={containerClass}>
      <header className="py-8 lg:py-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
          <Store aria-hidden="true" className="size-3.5" />
          Seller storefronts
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
          Meet our sellers
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
          The people and brands behind the products — artisans, farms and
          family businesses rooted in Nigeria and Ghana, alongside studios and
          labels from around the world. Every one of them is verified and
          backed by NeedCentral buyer protection.
        </p>
      </header>

      <ul className="grid gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((summary) => (
          <li key={summary.seller.id}>
            <SellerCard summary={summary} />
          </li>
        ))}
      </ul>
    </div>
  );
}
