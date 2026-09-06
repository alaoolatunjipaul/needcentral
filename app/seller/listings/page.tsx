import { notFound, redirect } from "next/navigation";
import { requireSellerAccess } from "@/lib/seller-access";
import { listSellerProducts } from "@/lib/sellers-data";
import { ListingManager } from "@/components/seller/ListingManager";

export const instant = false;

export default async function SellerListingsPage() {
  const access = await requireSellerAccess();
  if (!access.ok) {
    if (access.code === "unauthenticated") redirect("/signin");
    redirect("/seller");
  }

  const listings = (await listSellerProducts(access.seller.id, {
    includeUnpublished: true,
  })).map((p) => ({ ...p, listingStatus: p.listingStatus ?? "active" }));
  if (!listings) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
        Listings
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage the products in your storefront.
      </p>
      <div className="mt-6">
        <ListingManager listings={listings} />
      </div>
    </div>
  );
}