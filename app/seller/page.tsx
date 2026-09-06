import Link from "next/link";
import { ArrowRight, MapPin, Package, Plus, Store as StoreIcon } from "lucide-react";
import { requireSellerAccess } from "@/lib/seller-access";
import { listSellerProducts } from "@/lib/sellers-data";
import { BecomeSellerForm } from "@/components/seller/BecomeSellerForm";
import { btnPrimary, btnSecondary, containerClass } from "@/lib/ui";

export const instant = false;

export default async function SellerDashboardPage() {
  const access = await requireSellerAccess();

  if (!access.ok) {
    if (access.code === "unauthenticated") {
      return (
        <div className={containerClass}>
          <div className="mx-auto max-w-md py-16 sm:py-24">
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-zinc-100 text-zinc-400">
                <StoreIcon className="size-8" />
              </span>
              <h1 className="mt-5 text-xl font-bold text-zinc-900">
                Sign in to open a store
              </h1>
              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                Create a seller account to list products, manage your storefront
                and reach shoppers across the marketplace.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/signin" className={btnPrimary}>
                  Sign in
                </Link>
                <Link href="/signup" className={btnSecondary}>
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={containerClass}>
        <div className="mx-auto max-w-lg py-12 sm:py-16">
          <BecomeSellerForm />
        </div>
      </div>
    );
  }

  const { seller } = access;
  const listings = await listSellerProducts(seller.id, {
    includeUnpublished: true,
  });
  const activeCount = listings.filter((p) => p.listingStatus === "active").length;
  const unpublishedCount = listings.length - activeCount;

  return (
    <div>
      <header className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
          <StoreIcon aria-hidden="true" className="size-3.5" />
          Seller dashboard
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
          {seller.name}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            {seller.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Package aria-hidden="true" className="size-4 shrink-0" />
            {activeCount} active · {unpublishedCount} unpublished
          </span>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/seller/listings/new"
          className="group flex flex-col rounded-2xl bg-brand-600 p-6 text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus aria-hidden="true" className="size-6" />
          <span className="mt-3 font-semibold">Create a listing</span>
          <span className="mt-1 text-sm text-brand-100">
            Add a new product to your storefront
          </span>
        </Link>

        <Link
          href="/seller/listings"
          className="group flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition hover:ring-brand-300"
        >
          <Package aria-hidden="true" className="size-6 text-brand-600" />
          <span className="mt-3 font-semibold text-zinc-900">
            Manage listings
          </span>
          <span className="mt-1 text-sm text-zinc-500">
            Edit, unpublish or delete your products
          </span>
        </Link>

        <Link
          href="/seller/store"
          className="group flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 transition hover:ring-brand-300"
        >
          <StoreIcon aria-hidden="true" className="size-6 text-brand-600" />
          <span className="mt-3 font-semibold text-zinc-900">
            Store profile
          </span>
          <span className="mt-1 text-sm text-zinc-500">
            Update your store name, location and description
          </span>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-lg font-bold text-zinc-950">Your storefront</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Shoppers see only your active listings on this page.
          </p>
          <Link
            href={`/sellers/${seller.id}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
          >
            View storefront
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-lg font-bold text-zinc-950">
            Buyer orders & returns
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Order handling stays with the buyer and customer-care flows for this
            stage. Seller order tooling is future work.
          </p>
        </div>
      </div>
    </div>
  );
}