import "server-only";

import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import {
  CATEGORY_IDS,
  type CategoryId,
  type Product,
  type Seller,
} from "@/types";

// Roadmap #6 — seller self-service data layer.
//
// Provides the storefront-onboarding and listing-management operations for an
// authenticated user's own storefront. Every mutation is ownership-scoped to
// the signed-in user: the caller passes the authenticated userId, and each
// function derives/validates the owner server-side (the product's seller and
// that seller's userId) before allowing anything.
//
// The shape mirrors the existing conventions (server-only, Prisma-backed,
// returns plain TS shapes from types/index.ts).

const productSelect = {
  id: true,
  name: true,
  categoryId: true,
  sellerId: true,
  priceCents: true,
  compareAtPriceCents: true,
  image: true,
  description: true,
  rating: true,
  reviewCount: true,
  stock: true,
  featured: true,
  listingStatus: true,
  originCountry: true,
  originCountryCode: true,
  madeInAfrica: true,
  ratingDistribution: true,
} as const;

type ProductRow = {
  id: string;
  name: string;
  categoryId: string;
  sellerId: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  listingStatus: string;
  originCountry: string | null;
  originCountryCode: string | null;
  madeInAfrica: boolean | null;
  ratingDistribution: unknown;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.categoryId as CategoryId,
    priceCents: row.priceCents,
    compareAtPriceCents: row.compareAtPriceCents ?? undefined,
    image: row.image,
    description: row.description,
    rating: row.rating,
    reviewCount: row.reviewCount,
    ratingDistribution: row.ratingDistribution as
      | Product["ratingDistribution"]
      | undefined,
    stock: row.stock,
    featured: row.featured || undefined,
    listingStatus: row.listingStatus as "active" | "unpublished",
    sellerId: row.sellerId ?? undefined,
    origin:
      row.originCountry && row.originCountryCode && row.madeInAfrica !== null
        ? {
            country: row.originCountry,
            countryCode: row.originCountryCode,
            madeInAfrica: row.madeInAfrica,
          }
        : undefined,
  };
}

export type SellerAccessResult =
  | { ok: true; userId: string }
  | { ok: false; code: "unauthenticated" | "no-seller"; error: string };

// Server-side input validation. The client UX validates too, but every
// mutation re-validates here so the Server Actions and REST API can never be
// used to write malformed rows.

function validStoreName(value: unknown): value is string {
  const name = typeof value === "string" ? value.trim() : "";
  return name.length >= 3 && name.length <= 80;
}

function validLocation(value: unknown): value is string {
  const location = typeof value === "string" ? value.trim() : "";
  return location.length >= 2 && location.length <= 120;
}

function validDescription(value: unknown): value is string {
  const description = typeof value === "string" ? value.trim() : "";
  return description.length >= 10 && description.length <= 2000;
}

function validListingName(value: unknown): value is string {
  const name = typeof value === "string" ? value.trim() : "";
  return name.length >= 3 && name.length <= 120;
}

function validImage(value: unknown): value is string {
  const image = typeof value === "string" ? value.trim() : "";
  return image.length >= 3 && image.length <= 500;
}

export function validateListingInput(input: {
  name?: unknown;
  category?: unknown;
  priceCents?: unknown;
  compareAtPriceCents?: unknown;
  image?: unknown;
  description?: unknown;
  stock?: unknown;
}): { ok: true } | { ok: false; error: string } {
  if (!validListingName(input.name))
    return { ok: false, error: "Product name must be 3–120 characters." };
  if (
    typeof input.category !== "string" ||
    !(CATEGORY_IDS as readonly string[]).includes(input.category)
  )
    return { ok: false, error: "Please choose a valid category." };
  if (
    typeof input.priceCents !== "number" ||
    !Number.isSafeInteger(input.priceCents) ||
    input.priceCents <= 0
  )
    return { ok: false, error: "Price must be a positive whole number." };
  if (
    input.compareAtPriceCents !== undefined &&
    input.compareAtPriceCents !== null &&
    (typeof input.compareAtPriceCents !== "number" ||
      !Number.isSafeInteger(input.compareAtPriceCents) ||
      input.compareAtPriceCents <= 0)
  )
    return { ok: false, error: "Compare-at price must be a positive whole number." };
  if (!validImage(input.image))
    return { ok: false, error: "Please provide a valid image path or URL." };
  if (!validDescription(input.description))
    return { ok: false, error: "Description must be 10–2000 characters." };
  if (
    typeof input.stock !== "number" ||
    !Number.isSafeInteger(input.stock) ||
    input.stock < 0
  )
    return { ok: false, error: "Stock must be a whole number of 0 or more." };
  return { ok: true };
}

// Helpers -----------------------------------------------------------------

export async function getSellerByUserId(userId: string): Promise<Seller | null> {
  const row = await db.seller.findUnique({ where: { userId } });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    description: row.description,
    joinedYear: row.joinedYear,
    userId: row.userId ?? undefined,
  };
}

// Onboarding --------------------------------------------------------------

export type CreateSellerInput = {
  userId: string;
  storeName: string;
  location: string;
  description: string;
};

/**
 * Creates the single storefront owned by `userId`. Returns { ok } with the
 * created seller, or a typed error when the user already owns a store or the
 * payload is invalid. The new store reuses the storefront's URL identity (a
 * slugified store id) — no separate slug system.
 */
export async function createSellerStore(
  input: CreateSellerInput
): Promise<{ ok: true; seller: Seller } | { ok: false; error: string }> {
  if (!validStoreName(input.storeName))
    return { ok: false, error: "Store name must be 3–80 characters." };
  if (!validLocation(input.location))
    return { ok: false, error: "Please enter a valid store location." };
  if (!validDescription(input.description))
    return { ok: false, error: "Store description must be 10–2000 characters." };

  const existing = await getSellerByUserId(input.userId);
  if (existing) {
    return { ok: false, error: "You already have a seller store on NeedCentral." };
  }

  const id = slugifyStoreId(input.storeName);
  if (!id) {
    return { ok: false, error: "Please enter a valid store name." };
  }

  const conflict = await db.seller.findUnique({ where: { id } });
  if (conflict) {
    // Extremely unlikely for a fresh store; guard the slug uniqueness anyway.
    return {
      ok: false,
      error: "That store name is already taken. Please choose another.",
    };
  }

  const seller = await db.seller.create({
    data: {
      id,
      name: input.storeName,
      location: input.location,
      description: input.description,
      joinedYear: new Date().getFullYear(),
      userId: input.userId,
    },
  });

  return {
    ok: true,
    seller: {
      id: seller.id,
      name: seller.name,
      location: seller.location,
      description: seller.description,
      joinedYear: seller.joinedYear,
      userId: seller.userId ?? undefined,
    },
  };
}

// Storefront profile ------------------------------------------------------

export type UpdateStoreInput = {
  name?: string;
  location?: string;
  description?: string;
};

/**
 * Updates the authenticated user's own store profile. Ownership is derived
 * from `userId` — a user can only ever touch their own store.
 */
export async function updateSellerStore(
  userId: string,
  input: UpdateStoreInput
): Promise<{ ok: true; seller: Seller } | { ok: false; error: string }> {
  const seller = await getSellerByUserId(userId);
  if (!seller) return { ok: false, error: "You don't have a seller store yet." };

  if (input.name !== undefined && !validStoreName(input.name))
    return { ok: false, error: "Store name must be 3–80 characters." };
  if (input.location !== undefined && !validLocation(input.location))
    return { ok: false, error: "Please enter a valid store location." };
  if (input.description !== undefined && !validDescription(input.description))
    return { ok: false, error: "Store description must be 10–2000 characters." };

  const data: Prisma.SellerUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.location !== undefined) data.location = input.location;
  if (input.description !== undefined) data.description = input.description;

  const updated = await db.seller.update({ where: { id: seller.id }, data });

  return {
    ok: true,
    seller: {
      id: updated.id,
      name: updated.name,
      location: updated.location,
      description: updated.description,
      joinedYear: updated.joinedYear,
      userId: updated.userId ?? undefined,
    },
  };
}

// Listings ----------------------------------------------------------------

export async function listSellerProducts(
  sellerId: string,
  opts: { includeUnpublished?: boolean } = {}
): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: {
      sellerId,
      ...(opts.includeUnpublished ? {} : { listingStatus: "active" }),
    },
    orderBy: [{ listingStatus: "asc" }, { id: "asc" }],
    select: productSelect,
  });
  return rows.map(toProduct);
}

/**
 * Returns a single listing if it belongs to `sellerId` (ownership check), so
 * the seller dashboard can only ever load its own products.
 */
export async function getListingForSeller(
  sellerId: string,
  productId: string
): Promise<Product | undefined> {
  const row = await db.product.findFirst({
    where: { id: productId, sellerId },
    select: productSelect,
  });
  return row ? toProduct(row) : undefined;
}

export type CreateListingInput = {
  name: string;
  category: CategoryId;
  priceCents: number;
  compareAtPriceCents?: number;
  image: string;
  description: string;
  stock: number;
};

/**
 * Creates a listing for the authenticated user's own store. The product is
 * hard-wired to the caller's sellerId; a client can never attach a listing to
 * someone else's store because the seller is derived from the session user.
 */
export async function createListing(
  userId: string,
  input: CreateListingInput
): Promise<{ ok: true; product: Product } | { ok: false; error: string }> {
  const validation = validateListingInput(input);
  if (!validation.ok) return validation;

  const seller = await getSellerByUserId(userId);
  if (!seller) return { ok: false, error: "You don't have a seller store yet." };

  const product = await db.product.create({
    data: {
      id: generateProductId(seller.id, input.name),
      name: input.name,
      categoryId: input.category,
      sellerId: seller.id,
      priceCents: input.priceCents,
      compareAtPriceCents: input.compareAtPriceCents ?? null,
      image: input.image,
      description: input.description,
      rating: 0,
      reviewCount: 0,
      stock: input.stock,
      featured: false,
      listingStatus: "active",
    },
    select: productSelect,
  });

  return { ok: true, product: toProduct(product) };
}

export type UpdateListingInput = Partial<CreateListingInput>;

/**
 * Updates a listing — but only if it belongs to the caller's own store. The
 * product's sellerId is resolved first and compared to the owner's store;
 * otherwise a caller could edit another seller's product by id.
 */
export async function updateListing(
  userId: string,
  productId: string,
  input: UpdateListingInput
): Promise<{ ok: true; product: Product } | { ok: false; error: string }> {
  const validation = validateListingInput(input);
  if (!validation.ok) return validation;

  const ownership = await requireListingOwner(userId, productId);
  if (!ownership.ok) return ownership;

  const data: Prisma.ProductUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.category !== undefined)
    data.category = { connect: { id: input.category } };
  if (input.priceCents !== undefined) data.priceCents = input.priceCents;
  if (input.compareAtPriceCents !== undefined)
    data.compareAtPriceCents = input.compareAtPriceCents;
  if (input.image !== undefined) data.image = input.image;
  if (input.description !== undefined) data.description = input.description;
  if (input.stock !== undefined) data.stock = input.stock;

  const updated = await db.product.update({
    where: { id: productId },
    data,
    select: productSelect,
  });

  return { ok: true, product: toProduct(updated) };
}

/**
 * Sets a listing's storefront visibility. "active" shows it publicly;
 * "unpublished" hides it from all catalogue/storefront queries without
 * deleting the row. Ownership is enforced.
 */
export async function setListingStatus(
  userId: string,
  productId: string,
  status: "active" | "unpublished"
): Promise<{ ok: true; product: Product } | { ok: false; error: string }> {
  const ownership = await requireListingOwner(userId, productId);
  if (!ownership.ok) return ownership;

  const updated = await db.product.update({
    where: { id: productId },
    data: { listingStatus: status },
    select: productSelect,
  });

  return { ok: true, product: toProduct(updated) };
}

/**
 * Permanently deletes a listing — only if it belongs to the caller's own
 * store.
 */
export async function deleteListing(
  userId: string,
  productId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ownership = await requireListingOwner(userId, productId);
  if (!ownership.ok) return ownership;

  await db.product.delete({ where: { id: productId } });
  return { ok: true };
}

// Ownership ---------------------------------------------------------------

/**
 * Server-side ownership gate: resolves the product's seller, then verifies
 * that seller belongs to `userId`. Used by every listing mutation.
 */
async function requireListingOwner(
  userId: string,
  productId: string
): Promise<{ ok: true; sellerId: string } | { ok: false; error: string }> {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { sellerId: true },
  });
  if (!product) return { ok: false, error: "Listing not found." };

  const seller = await db.seller.findUnique({
    where: { id: product.sellerId ?? "" },
    select: { userId: true },
  });
  if (!seller || seller.userId !== userId) {
    return {
      ok: false,
      error: "You can only manage your own listings.",
    };
  }
  return { ok: true, sellerId: product.sellerId as string };
}

// Helpers -----------------------------------------------------------------

function slugifyStoreId(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || ""
  );
}

function generateProductId(sellerId: string, name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "listing";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
