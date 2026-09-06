import { redirect } from "next/navigation";
import { requireSellerAccess } from "@/lib/seller-access";
import { getAllCategories } from "@/lib/queries";
import { ListingForm } from "@/components/seller/ListingForm";

export const instant = false;

export default async function NewListingPage() {
  const access = await requireSellerAccess();
  if (!access.ok) {
    if (access.code === "unauthenticated") redirect("/signin");
    redirect("/seller");
  }

  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
        Create a listing
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Add a new product to your storefront. It appears publicly once created.
      </p>
      <div className="mt-6">
        <ListingForm categories={categories} />
      </div>
    </div>
  );
}