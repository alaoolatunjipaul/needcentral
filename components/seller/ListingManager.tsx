"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteListingAction,
  republishListingAction,
  unpublishListingAction,
} from "@/app/sellers/actions";
import { formatPrice } from "@/lib/utils";
import { categories } from "@/lib/data";
import type { ListingStatus, Product } from "@/types";

const categoryNameById = new Map(
  categories.map((c) => [c.id, c.name])
);

interface ListingRow {
  id: string;
  name: string;
  image: string;
  priceCents: number;
  stock: number;
  listingStatus: ListingStatus;
  category: Product["category"];
}

export function ListingManager({
  listings,
}: {
  listings: ListingRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(listing: ListingRow, status: ListingStatus) {
    startTransition(async () => {
      const result =
        status === "unpublished"
          ? await unpublishListingAction(listing.id)
          : await republishListingAction(listing.id);
      if (result.ok) {
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  }

  function remove(listing: ListingRow) {
    if (!window.confirm(`Delete "${listing.name}" permanently?`)) return;
    startTransition(async () => {
      const result = await deleteListingAction(listing.id);
      if (result.ok) {
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {listings.length} listing{listings.length === 1 ? "" : "s"} in your
          store
        </p>
        <Link
          href="/seller/listings/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <Plus aria-hidden="true" className="size-4" />
          New listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-zinc-500">
            You have no listings yet. Create your first one to start selling.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200">
          {listings.map((listing) => {
            const isActive = listing.listingStatus === "active";
            return (
              <li key={listing.id} className="flex items-center gap-4 p-4">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  <Image
                    src={listing.image}
                    alt={listing.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-900">
                    {listing.name}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span className="font-medium text-zinc-700">
                      {formatPrice(listing.priceCents)}
                    </span>
                    <span>{categoryNameById.get(listing.category)}</span>
                    <span>
                      {listing.stock > 0
                        ? `${listing.stock} in stock`
                        : "Out of stock"}
                    </span>
                    <span
                      className={
                        isActive
                          ? "rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700"
                          : "rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-500"
                      }
                    >
                      {isActive ? "Active" : "Unpublished"}
                    </span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {isActive && (
                    <Link
                      href={`/products/${listing.id}`}
                      className="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 sm:block"
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/seller/listings/${listing.id}`}
                    aria-label={`Edit ${listing.name}`}
                    className="grid size-8 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setStatus(
                        listing,
                        isActive ? "unpublished" : "active"
                      )
                    }
                    disabled={isPending}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-zinc-300 transition hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {isActive ? "Unpublish" : "Republish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(listing)}
                    disabled={isPending}
                    aria-label={`Delete ${listing.name}`}
                    className="grid size-8 place-items-center rounded-full text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs leading-5 text-zinc-400">
        Unpublished listings are hidden from the storefront but stay saved so
        you can republish them later. Deleting removes a listing permanently.
      </p>
    </div>
  );
}