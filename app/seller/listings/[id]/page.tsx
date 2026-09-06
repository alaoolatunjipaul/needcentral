import { notFound, redirect } from "next/navigation";
import { requireSellerAccess } from "@/lib/seller-access";
import { getListingForSeller } from "@/lib/sellers-data";
import { getAllCategories } from "@/lib/queries";
import { ListingForm } from "@/components/seller/ListingForm";

export const instant = false;

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const { id } = await params;

  const access = await requireSellerAccess();
  if (!access.ok) {
    if (access.code === "unauthenticated") redirect("/signin");
    redirect("/seller");
  }

  const listing = await getListingForSeller(access.seller.id, id);
  if (!listing) notFound();

  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
        Edit listing
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Update the details of {listing.name}. Changes go live immediately for
        active listings.
      </p>
      <div className="mt-6">
        <ListingForm categories={categories} product={listing} />
      </div>
    </div>
  );
}