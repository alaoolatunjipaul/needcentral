import { redirect } from "next/navigation";
import { requireSellerAccess } from "@/lib/seller-access";
import { StoreProfileForm } from "@/components/seller/StoreProfileForm";

export const instant = false;

export default async function StoreProfilePage() {
  const access = await requireSellerAccess();
  if (!access.ok) {
    if (access.code === "unauthenticated") redirect("/signin");
    redirect("/seller");
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
        Store profile
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Shoppers see this on your public storefront.
      </p>
      <div className="mt-6">
        <StoreProfileForm seller={access.seller} />
      </div>
    </div>
  );
}