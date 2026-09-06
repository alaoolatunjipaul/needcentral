"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Store } from "lucide-react";
import { becomeSellerAction } from "@/app/sellers/actions";
import { btnPrimary, inputBase } from "@/lib/ui";

export function BecomeSellerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = storeName.trim();
    const trimmedLocation = location.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length < 3) {
      setError("Store name must be at least 3 characters.");
      return;
    }
    if (trimmedLocation.length < 2) {
      setError("Please enter your store location.");
      return;
    }
    if (trimmedDescription.length < 10) {
      setError("Store description must be at least 10 characters.");
      return;
    }

    startTransition(async () => {
      const result = await becomeSellerAction({
        storeName: trimmedName,
        location: trimmedLocation,
        description: trimmedDescription,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/seller");
      router.refresh();
    });
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 sm:p-10">
      <div className="flex flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100"
        >
          <Store className="size-6" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-950">
          Open your NeedCentral store
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          You are signed in. Tell shoppers a bit about your store to start
          listing products for sale.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="seller-store-name"
            className="block text-sm font-medium text-zinc-700"
          >
            Store name
          </label>
          <input
            id="seller-store-name"
            type="text"
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. Ade's Artisan Kitchen"
            className={`${inputBase} mt-1.5`}
          />
        </div>

        <div>
          <label
            htmlFor="seller-location"
            className="block text-sm font-medium text-zinc-700"
          >
            Location
          </label>
          <input
            id="seller-location"
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Ikeja, Lagos, Nigeria"
            className={`${inputBase} mt-1.5`}
          />
        </div>

        <div>
          <label
            htmlFor="seller-description"
            className="block text-sm font-medium text-zinc-700"
          >
            Store description
          </label>
          <textarea
            id="seller-description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell shoppers what you make, where it comes from and why you care."
            className={`${inputBase} mt-1.5 resize-y`}
          />
        </div>

        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending ? "Opening store…" : "Open my store"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Not ready yet?{" "}
        <Link
          href="/"
          className="font-semibold text-brand-700 transition hover:text-brand-800"
        >
          Keep browsing
        </Link>
      </p>
    </div>
  );
}