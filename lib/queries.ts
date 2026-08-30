import {
  CATEGORY_IDS,
  type Category,
  type CategoryId,
  type Product,
  type ProductQuery,
  type ProductQueryResult,
  type RatingDistribution,
  type Seller,
  type SellerSummary,
} from "@/types";
import { db } from "@/lib/db";

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

function toSeller(row: {
  id: string;
  name: string;
  location: string;
  description: string;
  joinedYear: number;
}): Seller {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    description: row.description,
    joinedYear: row.joinedYear,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await db.product.findMany({
    orderBy: { id: "asc" },
    select: productSelect,
  });
  return rows.map(toProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const row = await db.product.findUnique({
    where: { id },
    select: productSelect,
  });
  return row ? toProduct(row) : undefined;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: { featured: true },
    orderBy: { rating: "desc" },
    take: limit,
    select: productSelect,
  });
  return rows.map(toProduct);
}

export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  const rows = await db.product.findMany({
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    take: limit,
    select: productSelect,
  });
  return rows.map(toProduct);
}

export async function getAfricanMadeProducts(): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: { madeInAfrica: true },
    select: productSelect,
  });
  return rows.map(toProduct);
}

export async function countAfricanMadeProducts(): Promise<number> {
  return db.product.count({ where: { madeInAfrica: true } });
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const sameCategory = await db.product.findMany({
    where: { categoryId: product.category, id: { not: product.id } },
    orderBy: { rating: "desc" },
    take: limit,
    select: productSelect,
  });
  if (sameCategory.length >= limit) return sameCategory.map(toProduct);

  const existingIds = new Set(
    sameCategory.map((p) => p.id).concat(product.id)
  );
  const fillers = await db.product.findMany({
    where: {
      featured: true,
      categoryId: { not: product.category },
      id: { notIn: [...existingIds] },
    },
    orderBy: { rating: "desc" },
    take: limit - sameCategory.length,
    select: productSelect,
  });
  return [...sameCategory, ...fillers].map(toProduct);
}

export async function getCategoryCounts(): Promise<
  Record<CategoryId | "all", number>
> {
  const total = await db.product.count();
  const grouped = await db.product.groupBy({
    by: ["categoryId"],
    _count: { _all: true },
  });
  const counts = { all: total } as Record<CategoryId | "all", number>;
  for (const id of CATEGORY_IDS) counts[id] = 0;
  for (const group of grouped) {
    counts[group.categoryId as CategoryId] = group._count._all;
  }
  return counts;
}

export async function getSellerProducts(sellerId: string): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: { sellerId },
    select: productSelect,
  });
  return rows.map(toProduct);
}

export async function getSellerById(id: string): Promise<Seller | undefined> {
  const row = await db.seller.findUnique({ where: { id } });
  return row ? toSeller(row) : undefined;
}

export async function getSellerSummary(
  sellerId: string
): Promise<SellerSummary | undefined> {
  const seller = await db.seller.findUnique({ where: { id: sellerId } });
  if (!seller) return undefined;

  const sellerProducts = await db.product.findMany({
    where: { sellerId },
    select: productSelect,
  });
  const mapped = sellerProducts.map(toProduct);
  const reviewCount = mapped.reduce((sum, p) => sum + p.reviewCount, 0);
  const avgRating = mapped.length
    ? mapped.reduce((sum, p) => sum + p.rating, 0) / mapped.length
    : 0;
  return {
    seller: toSeller(seller),
    productCount: mapped.length,
    avgRating,
    reviewCount,
    africanMadeCount: mapped.filter(
      (p) => p.origin?.madeInAfrica === true
    ).length,
  };
}

export async function getSellerSummaries(): Promise<SellerSummary[]> {
  const sellers = await db.seller.findMany({ orderBy: { id: "asc" } });
  return Promise.all(sellers.map((s) => getSellerSummary(s.id) as Promise<SellerSummary>));
}

export async function getAllCategories(): Promise<Category[]> {
  const rows = await db.category.findMany({ orderBy: { id: "asc" } });
  return rows.map((c) => ({ id: c.id as CategoryId, name: c.name, tagline: c.tagline }));
}

export async function filterAndSortProducts(
  query: ProductQuery
): Promise<ProductQueryResult> {
  const needle = query.q?.trim().toLowerCase() ?? "";

  const where: Record<string, unknown> = {
    ...(query.category !== "all" ? { categoryId: query.category } : {}),
    ...(query.collection === "african-made" ? { madeInAfrica: true } : {}),
    ...(needle
      ? {
          OR: [
            { name: { contains: needle, mode: "insensitive" } },
            { description: { contains: needle, mode: "insensitive" } },
            { originCountry: { contains: needle, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy =
    query.sort === "price-asc"
      ? { priceCents: "asc" as const }
      : query.sort === "price-desc"
        ? { priceCents: "desc" as const }
        : query.sort === "rating"
          ? { rating: "desc" as const }
          : query.sort === "name"
            ? { name: "asc" as const }
            : undefined;

  const [rows, total] = await Promise.all([
    db.product.findMany({ where, orderBy, select: productSelect }),
    db.product.count({ where }),
  ]);

  return { items: rows.map(toProduct), total };
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
