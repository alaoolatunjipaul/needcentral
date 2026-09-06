"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth-service";
import {
  createListing,
  createSellerStore,
  deleteListing,
  setListingStatus,
  updateListing,
  updateSellerStore,
  type CreateListingInput,
  type UpdateListingInput,
} from "@/lib/sellers-data";
import type { Product, Seller } from "@/types";

// Roadmap #6 — seller self-service server actions.
//
// Every mutation here requires the real database-backed session (never the
// localStorage/demo auth state) and then delegates to lib/sellers-data.ts,
// which derives product ownership from the authenticated user. No client
// supplied `sellerId` or `userId` is ever trusted.

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

type SellerAction = ActionResult<{ seller: Seller }>;
type ProductAction = ActionResult<{ product: Product }>;

async function requireSession(): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, error: "Please sign in to manage your store." };
  }
  return { ok: true, userId: session.id };
}

async function guard<T>(
  run: () => Promise<T>
): Promise<T> {
  try {
    return await run();
  } catch (err) {
    console.error("Seller action failed:", err);
    return {
      ok: false,
      error: "Something went wrong. Please try again in a moment.",
    } as T;
  }
}

export async function becomeSellerAction(input: {
  storeName: string;
  location: string;
  description: string;
}): Promise<SellerAction> {
  const session = await requireSession();
  if (!session.ok) return session;

  return guard(async () => {
    const result = await createSellerStore({
      userId: session.userId,
      storeName: input.storeName,
      location: input.location,
      description: input.description,
    });
    if (!result.ok) return result;
    revalidatePath("/seller");
    return { ok: true, data: { seller: result.seller } };
  });
}

export async function updateStoreAction(input: {
  name?: string;
  location?: string;
  description?: string;
}): Promise<SellerAction> {
  const session = await requireSession();
  if (!session.ok) return session;

  return guard(async () => {
    const result = await updateSellerStore(session.userId, input);
    if (!result.ok) return result;
    revalidatePath("/seller");
    return { ok: true, data: { seller: result.seller } };
  });
}

export async function createListingAction(
  input: CreateListingInput
): Promise<ProductAction> {
  const session = await requireSession();
  if (!session.ok) return session;

  return guard(async () => {
    const result = await createListing(session.userId, input);
    if (!result.ok) return result;
    revalidatePath("/seller");
    return { ok: true, data: { product: result.product } };
  });
}

export async function updateListingAction(
  productId: string,
  input: UpdateListingInput
): Promise<ProductAction> {
  const session = await requireSession();
  if (!session.ok) return session;

  return guard(async () => {
    const result = await updateListing(session.userId, productId, input);
    if (!result.ok) return result;
    revalidatePath("/seller");
    return { ok: true, data: { product: result.product } };
  });
}

export async function unpublishListingAction(
  productId: string
): Promise<ProductAction> {
  const session = await requireSession();
  if (!session.ok) return session;

  return guard(async () => {
    const result = await setListingStatus(
      session.userId,
      productId,
      "unpublished"
    );
    if (!result.ok) return result;
    revalidatePath("/seller");
    return { ok: true, data: { product: result.product } };
  });
}

export async function republishListingAction(
  productId: string
): Promise<ProductAction> {
  const session = await requireSession();
  if (!session.ok) return session;

  return guard(async () => {
    const result = await setListingStatus(session.userId, productId, "active");
    if (!result.ok) return result;
    revalidatePath("/seller");
    return { ok: true, data: { product: result.product } };
  });
}

export async function deleteListingAction(
  productId: string
): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.ok) return session;

  return guard(async () => {
    const result = await deleteListing(session.userId, productId);
    if (!result.ok) return result;
    revalidatePath("/seller");
    return { ok: true, data: undefined };
  });
}
