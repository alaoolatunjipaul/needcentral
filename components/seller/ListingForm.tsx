"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  createListingAction,
  updateListingAction,
} from "@/app/sellers/actions";
import { btnPrimary, inputBase } from "@/lib/ui";
import {
  CATEGORY_IDS,
  type Category,
  type CategoryId,
  type Product,
} from "@/types";

const PLACEHOLDER_IMAGE = "/images/products/listing-placeholder.svg";

interface ListingFormProps {
  categories: Category[];
  product?: Product;
}

export function ListingForm({ categories, product }: ListingFormProps) {
  const router = useRouter();
  const isEditing = Boolean(product);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<CategoryId>(
    product?.category ?? ("electronics" as CategoryId)
  );
  const [price, setPrice] = useState(
    product ? String(product.priceCents) : ""
  );
  const [compareAt, setCompareAt] = useState(
    product?.compareAtPriceCents !== undefined
      ? String(product.compareAtPriceCents)
      : ""
  );
  const [stock, setStock] = useState(
    product ? String(product.stock) : ""
  );
  const [image, setImage] = useState(product?.image ?? PLACEHOLDER_IMAGE);
  const [description, setDescription] = useState(product?.description ?? "");

  function parseCents(raw: string): number | null {
    const n = Math.floor(Number(raw));
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      setError("Product name must be at least 3 characters.");
      return;
    }
    if (!CATEGORY_IDS.includes(category as (typeof CATEGORY_IDS)[number])) {
      setError("Please choose a valid category.");
      return;
    }
    const priceCents = parseCents(price);
    if (priceCents === null || priceCents <= 0) {
      setError("Price must be a positive number (in naira).");
      return;
    }
    const compareValue = compareAt.trim() === "" ? null : parseCents(compareAt);
    if (compareValue !== null && compareValue <= 0) {
      setError("Compare-at price must be a positive number.");
      return;
    }
    const stockValue = parseCents(stock);
    if (stockValue === null) {
      setError("Stock must be a whole number.");
      return;
    }
    const trimmedImage = image.trim();
    if (!trimmedImage) {
      setError("Please provide an image path or URL.");
      return;
    }
    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }

    const payload = {
      name: trimmedName,
      category,
      priceCents,
      ...(compareValue !== null ? { compareAtPriceCents: compareValue } : {}),
      stock: stockValue,
      image: trimmedImage,
      description: trimmedDescription,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateListingAction(product!.id, payload)
        : await createListingAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/seller/listings");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 sm:p-8"
    >
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200"
        >
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="listing-name"
            className="block text-sm font-medium text-zinc-700"
          >
            Product name
          </label>
          <input
            id="listing-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Handwoven Raffia Tote"
            className={`${inputBase} mt-1.5`}
          />
        </div>

        <div>
          <label
            htmlFor="listing-category"
            className="block text-sm font-medium text-zinc-700"
          >
            Category
          </label>
          <select
            id="listing-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryId)}
            className={`${inputBase} mt-1.5`}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="listing-stock"
            className="block text-sm font-medium text-zinc-700"
          >
            Stock
          </label>
          <input
            id="listing-stock"
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="How many you have"
            className={`${inputBase} mt-1.5`}
          />
        </div>

        <div>
          <label
            htmlFor="listing-price"
            className="block text-sm font-medium text-zinc-700"
          >
            Price (₦)
          </label>
          <input
            id="listing-price"
            type="number"
            min={1}
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 2500000"
            className={`${inputBase} mt-1.5`}
          />
          <p className="mt-1 text-xs text-zinc-400">
            Whole naira. Example: ₦25,000 = 2500000.
          </p>
        </div>

        <div>
          <label
            htmlFor="listing-compare"
            className="block text-sm font-medium text-zinc-700"
          >
            Compare-at price (₦)
          </label>
          <input
            id="listing-compare"
            type="number"
            min={1}
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            placeholder="Optional, for discounts"
            className={`${inputBase} mt-1.5`}
          />
        </div>

        <div>
          <label
            htmlFor="listing-image"
            className="block text-sm font-medium text-zinc-700"
          >
            Image path or URL
          </label>
          <input
            id="listing-image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className={`${inputBase} mt-1.5`}
          />
          <p className="mt-1 text-xs text-zinc-400">
            Leave default to use the placeholder.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="listing-description"
            className="block text-sm font-medium text-zinc-700"
          >
            Description
          </label>
          <textarea
            id="listing-description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell buyers what makes this product worth buying."
            className={`${inputBase} mt-1.5 resize-y`}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
              ? "Save changes"
              : "Create listing"}
        </button>
        {/* Preview thumbnail */}
        {image.trim() && (
          <span className="relative h-14 w-14 overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200">
            <Image src={image.trim()} alt="Listing preview" fill sizes="56px" className="object-cover" />
          </span>
        )}
      </div>
    </form>
  );
}