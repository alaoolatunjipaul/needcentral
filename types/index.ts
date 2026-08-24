/**
 * NeedCentral shared domain types.
 *
 * Money is stored in minor currency units ("cents") — the Nigerian Naira
 * (₦, kobo) is the launch market. The field name `priceCents` is kept for
 * historical continuity and always means "minor units of the active market
 * currency" so a multi-currency layer can be added later without schema churn.
 */

export const CATEGORY_IDS = [
  "electronics",
  "phones-accessories",
  "computers-tech",
  "fashion",
  "beauty-personal-care",
  "home-living",
  "food-groceries",
  "health-wellness",
  "baby-kids",
  "sports-fitness",
  "books-media",
  "arts-crafts",
  "jewelry-accessories",
  "automotive",
  "agriculture-farm",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
}

/** Curated cross-department collections, e.g. the African-made showcase. */
export const COLLECTION_IDS = ["african-made"] as const;

export type CollectionId = (typeof COLLECTION_IDS)[number];

export interface ProductOrigin {
  /** Human-readable country name, e.g. "Nigeria", "Ghana". */
  country: string;
  /** ISO 3166-1 alpha-2 code, e.g. "NG", "GH". */
  countryCode: string;
  madeInAfrica: boolean;
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
  sellerId?: string;
  origin?: ProductOrigin;
}

export interface Seller {
  id: string;
  name: string;
  location: string;
  description: string;
  joinedYear: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  location?: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  priceCents: number;
  quantity: number;
  maxQuantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface CartTotals {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "name";

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
  collection: CollectionId | "all";
  sort: SortOption;
}

/**
 * Filter shape aligned with how a future REST/Prisma backend would accept
 * catalogue queries (Project 7+). The current frontend query is a subset.
 */
export interface ProductFilter {
  q?: string;
  category?: CategoryId | "all";
  collection?: CollectionId | "all";
  minPriceCents?: number;
  maxPriceCents?: number;
  sort?: SortOption;
}

export interface ProductQueryResult {
  items: Product[];
  total: number;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export type DeliveryOptionId = "standard" | "express" | "pickup";

export interface DeliveryOption {
  id: DeliveryOptionId;
  label: string;
  description: string;
  etaMinDays: number;
  etaMaxDays: number;
  priceCents: number;
  /** Subtotal at or above which delivery becomes free (standard delivery). */
  freeThresholdCents?: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  priceCents: number;
  quantity: number;
}

export interface Order {
  id: string;
  email: string;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  status: OrderStatus;
  deliveryOptionId: DeliveryOptionId;
  shippingAddress?: Address;
  placedAtISO: string;
  estimatedDeliveryISO: string;
}

/**
 * Mock-only coupon structure. Real validation arrives with the backend
 * projects; the checkout keeps this shape ready.
 */
export interface Coupon {
  code: string;
  description: string;
  percentOff?: number;
  amountOffCents?: number;
  minSubtotalCents?: number;
}

/** Merchandising promotion rendered by the homepage deal banner. */
export interface Promotion {
  id: string;
  badge: string;
  productId: string;
  endsAtISO?: string;
}
