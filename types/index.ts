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
  /** Per-star counts, once verified review data provides them. */
  ratingDistribution?: RatingDistribution[];
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

/**
 * Derived storefront stats computed from a seller's product catalogue —
 * sellers do not carry their own rating; it is aggregated from products.
 */
export interface SellerSummary {
  seller: Seller;
  productCount: number;
  avgRating: number;
  reviewCount: number;
  africanMadeCount: number;
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
  /** Optional user-submitted photos stored as data URLs (localStorage demo). */
  images?: string[];
}

/**
 * Per-star review counts for a product (5 → 1). Optional until the backend
 * supplies verified breakdowns; the UI renders it only when present so mock
 * data is never embellished.
 */
export interface RatingDistribution {
  stars: number;
  count: number;
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

/**
 * Client-side snapshot of a product saved for later. Mirrors the cart item
 * shape minus quantity so the wishlist store stays persistence-friendly.
 */
export interface WishlistItem {
  productId: string;
  name: string;
  image: string;
  priceCents: number;
}

export interface Wishlist {
  items: WishlistItem[];
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
  /** Domestic (Nigeria) flat price. */
  priceCents: number;
  /** Subtotal at or above which delivery becomes free (standard delivery). */
  freeThresholdCents?: number;
  /**
   * Whether this option is offered outside the launch market. Pickup is
   * intentionally domestic-only.
   */
  crossBorderAvailable?: boolean;
  /** Flat price applied when delivering to a cross-border country. */
  crossBorderPriceCents?: number;
  /** Upper ETA bound used for cross-border deliveries (slower than domestic). */
  crossBorderEtaMaxDays?: number;
}

/**
 * A NeedCentral pickup point where customers can collect their order. Pickup
 * stations are domestic (Nigeria) only and span multiple cities.
 */
export interface PickupStation {
  id: string;
  city: string;
  name: string;
  address: string;
  /** Estimated days until the order is ready for collection. */
  etaDays: number;
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
  /** True when the delivery country is outside the launch market (Nigeria). */
  crossBorder?: boolean;
  /** Resolved pickup point for pickup deliveries (domestic only). */
  pickupStation?: PickupStation;
  shippingAddress?: Address;
  placedAtISO: string;
  estimatedDeliveryISO: string;
  /** Simulated coupon preserved for order history (optional for legacy orders). */
  couponCode?: string;
  couponDescription?: string;
  discountCents?: number;

  /** Payment gateway metadata, set after server-side verification/webhook. */
  paymentProvider?: "paystack";
  paymentReference?: string;
  paidAtISO?: string;
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

/**
 * Product Q&A — a customer question and its answer(s). Structured like
 * Review so the same seed-and-hash pattern can produce deterministic
 * mock data per product without a backend.
 */
export interface Answer {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface Question {
  id: string;
  productId: string;
  author: string;
  body: string;
  createdAt: string;
  answers: Answer[];
}

/**
 * Simulated customer account. Passwords are stored in plain text because
 * this is a frontend-only demo — real hashing arrives with the backend
 * projects.
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  password: string;
}

/** Merchandising promotion rendered by the homepage deal banner. */
export interface Promotion {
  id: string;
  badge: string;
  productId: string;
  endsAtISO?: string;
}
