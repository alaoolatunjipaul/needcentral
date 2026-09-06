"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Check } from "lucide-react";
import { updateStoreAction } from "@/app/sellers/actions";
import { btnPrimary, inputBase } from "@/lib/ui";
import type { Seller } from "@/types";

export function StoreProfileForm({ seller }: { seller: Seller }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(seller.name);
  const [location, setLocation] = useState(seller.location);
  const [description, setDescription] = useState(seller.description);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    const trimmedName = name.trim();
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
      const result = await updateStoreAction({
        name: trimmedName,
        location: trimmedLocation,
        description: trimmedDescription,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 sm:p-8"
    >
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200"
        >
          {error}
        </div>
      )}

      {saved && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200"
        >
          <Check aria-hidden="true" className="size-4" />
          Store profile saved.
        </div>
      )}

      <div>
        <label
          htmlFor="store-name"
          className="block text-sm font-medium text-zinc-700"
        >
          Store name
        </label>
        <input
          id="store-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputBase} mt-1.5`}
        />
        <p className="mt-1 text-xs text-zinc-400">
          Your storefront URL stays the same — this only changes the display
          name.
        </p>
      </div>

      <div>
        <label
          htmlFor="store-location"
          className="block text-sm font-medium text-zinc-700"
        >
          Location
        </label>
        <input
          id="store-location"
          type="text"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={`${inputBase} mt-1.5`}
        />
      </div>

      <div>
        <label
          htmlFor="store-description"
          className="block text-sm font-medium text-zinc-700"
        >
          Description
        </label>
        <textarea
          id="store-description"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputBase} mt-1.5 resize-y`}
        />
      </div>

      <button type="submit" disabled={isPending} className={btnPrimary}>
        {isPending ? "Saving…" : "Save store profile"}
      </button>
    </form>
  );
}