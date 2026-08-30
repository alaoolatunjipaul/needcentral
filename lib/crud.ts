import "server-only";

import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import type {
  Category,
  CategoryId,
  Product,
  ProductOrigin,
  RatingDistribution,
  Seller,
} from "@/types";

/**
 * Typed write layer for the NeedCentral storefront catalogue (Project 5,
 * "CRUD through Prisma"). This is the reverse of lib/queries.ts: it exposes
 * create / update / delete operations that persist to PostgreSQL via Prisma
 * through the shared `db` singleton, mapping directly between the app's TS
 * shapes and the Prisma model fields.
 *
 * These functions are server-only and are the foundation for later server
 * actions / API routes; they are intentionally not wired to any UI yet.
 *
 * Foreign-key behaviour enforced by the schema:
 *   - deleting a Category that still has products → FK RESTRICT error (callers
 *     must reassign or remove its products first).
 *   - deleting a Seller → its products' sellerId is SET NULL (products remain).
 */

export interface CategoryInput {
  id: string;
  name: string;
  tagline: string;
}

export interface SellerInput {
  id: string;
  name: string;
  location: string;
  description: string;
  joinedYear: number;
}

export interface ProductInput {
  id: string;
  name: string;
  category: CategoryId;
  sellerId?: string;
  priceCents: number;
  compareAtPriceCents?: number;
  image: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  featured?: boolean;
  origin?: ProductOrigin;
  ratingDistribution?: RatingDistribution[];
}

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
      | RatingDistribution[]
      | undefined,
    stock: row.stock,
    featured: row.featured || undefined,
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
  originCountry: true,
  originCountryCode: true,
  madeInAfrica: true,
  ratingDistribution: true,
} as const;

// Categories -------------------------------------------------------------

export async function createCategory(input: CategoryInput): Promise<Category> {
  const row = await db.category.create({
    data: {
      id: input.id,
      name: input.name,
      tagline: input.tagline,
    },
    select: { id: true, name: true, tagline: true },
  });
  return { id: row.id as CategoryId, name: row.name, tagline: row.tagline };
}

export async function updateCategory(
  id: string,
  patch: Partial<Omit<CategoryInput, "id">>
): Promise<Category> {
  const row = await db.category.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.tagline !== undefined ? { tagline: patch.tagline } : {}),
    },
    select: { id: true, name: true, tagline: true },
  });
  return { id: row.id as CategoryId, name: row.name, tagline: row.tagline };
}

export async function deleteCategory(id: string): Promise<void> {
  await db.category.delete({ where: { id } });
}

// Sellers ----------------------------------------------------------------

export async function createSeller(input: SellerInput): Promise<Seller> {
  return db.seller.create({
    data: {
      id: input.id,
      name: input.name,
      location: input.location,
      description: input.description,
      joinedYear: input.joinedYear,
    },
    select: {
      id: true,
      name: true,
      location: true,
      description: true,
      joinedYear: true,
    },
  });
}

export async function updateSeller(
  id: string,
  patch: Partial<Omit<SellerInput, "id">>
): Promise<Seller> {
  return db.seller.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.location !== undefined ? { location: patch.location } : {}),
      ...(patch.description !== undefined
        ? { description: patch.description }
        : {}),
      ...(patch.joinedYear !== undefined
        ? { joinedYear: patch.joinedYear }
        : {}),
    },
    select: {
      id: true,
      name: true,
      location: true,
      description: true,
      joinedYear: true,
    },
  });
}

export async function deleteSeller(id: string): Promise<void> {
  await db.seller.delete({ where: { id } });
}

// Products ---------------------------------------------------------------

export async function createProduct(input: ProductInput): Promise<Product> {
  const row = await db.product.create({
    data: {
      id: input.id,
      name: input.name,
      categoryId: input.category,
      sellerId: input.sellerId ?? null,
      priceCents: input.priceCents,
      compareAtPriceCents: input.compareAtPriceCents ?? null,
      image: input.image,
      description: input.description,
      rating: input.rating ?? 0,
      reviewCount: input.reviewCount ?? 0,
      stock: input.stock ?? 0,
      featured: input.featured ?? false,
      originCountry: input.origin?.country ?? null,
      originCountryCode: input.origin?.countryCode ?? null,
      madeInAfrica: input.origin?.madeInAfrica ?? null,
      ratingDistribution: input.ratingDistribution
        ? (input.ratingDistribution as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    },
    select: productSelect,
  });
  return toProduct(row);
}

export async function updateProduct(
  id: string,
  patch: Partial<Omit<ProductInput, "id">>
): Promise<Product> {
  const data: Prisma.ProductUpdateInput = {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.category !== undefined
      ? { category: { connect: { id: patch.category } } }
      : {}),
    ...(patch.sellerId !== undefined
      ? { seller: { connect: { id: patch.sellerId } } }
      : {}),
    ...(patch.priceCents !== undefined
      ? { priceCents: patch.priceCents }
      : {}),
    ...(patch.compareAtPriceCents !== undefined
      ? { compareAtPriceCents: patch.compareAtPriceCents }
      : {}),
    ...(patch.image !== undefined ? { image: patch.image } : {}),
    ...(patch.description !== undefined
      ? { description: patch.description }
      : {}),
    ...(patch.rating !== undefined ? { rating: patch.rating } : {}),
    ...(patch.reviewCount !== undefined
      ? { reviewCount: patch.reviewCount }
      : {}),
    ...(patch.stock !== undefined ? { stock: patch.stock } : {}),
    ...(patch.featured !== undefined ? { featured: patch.featured } : {}),
    ...(patch.origin !== undefined
      ? {
          originCountry: patch.origin?.country ?? null,
          originCountryCode: patch.origin?.countryCode ?? null,
          madeInAfrica: patch.origin?.madeInAfrica ?? null,
        }
      : {}),
    ...(patch.ratingDistribution !== undefined
      ? {
          ratingDistribution: patch.ratingDistribution
            ? (patch.ratingDistribution as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        }
      : {}),
  };

  const row = await db.product.update({
    where: { id },
    data,
    select: productSelect,
  });
  return toProduct(row);
}

export async function deleteProduct(id: string): Promise<void> {
  await db.product.delete({ where: { id } });
}
