export const CATEGORY_IDS = [
  "audio",
  "mobile",
  "computers",
  "wearables",
  "photography",
  "gaming",
  "home-living",
  "fitness",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  priceCents: number;
  compareAtPriceCents?: number;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  stock: number;
  featured?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  priceCents: number;
  quantity: number;
  maxQuantity: number;
}

export interface CartTotals {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}

export type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "name";

export const SORT_OPTIONS: readonly SortOption[] = [
  "featured",
  "price-asc",
  "price-desc",
  "rating",
  "name",
] as const;

export interface ProductQuery {
  q: string;
  category: CategoryId | "all";
  sort: SortOption;
}

export interface ProductQueryResult {
  items: Product[];
  total: number;
}
