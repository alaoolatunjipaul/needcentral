import "server-only";

import { getServerSession } from "@/lib/auth-service";
import { getSellerByUserId } from "@/lib/sellers-data";
import type { Seller } from "@/types";

// Shared serializer between the server session and the seller owner for the
// seller dashboard. Returns the live seller store owned by the signed-in user,
// or a typed error when unauthenticated / not a seller.

export type SellerAccessResult =
  | { ok: true; seller: Seller; userId: string }
  | { ok: false; code: "unauthenticated" | "no-seller"; error: string };

export async function requireSellerAccess(): Promise<SellerAccessResult> {
  const session = await getServerSession();
  if (!session) {
    return {
      ok: false,
      code: "unauthenticated",
      error: "Please sign in to manage your seller store.",
    };
  }

  const seller = await getSellerByUserId(session.id);
  if (!seller) {
    return {
      ok: false,
      code: "no-seller",
      error: "You don't have a seller store yet.",
    };
  }

  return { ok: true, seller, userId: session.id };
}

export async function getOptionalSeller(): Promise<Seller | null> {
  const session = await getServerSession();
  if (!session) return null;
  return getSellerByUserId(session.id);
}