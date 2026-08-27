# NeedCentral — Online Marketplace

A production-quality demo marketplace built with **Next.js (App Router), TypeScript, React and Tailwind CSS**. Browse a curated catalogue, search and filter products, view rich product detail pages and manage a fully client-side shopping cart with a simulated checkout.

NeedCentral is a **global marketplace born in Nigeria** — starting with Nigerian sellers, prices and logistics, proudly showcasing African makers as a signature collection, and designed so individual sellers, small businesses, large businesses, brands and creators from anywhere can reach customers in Nigeria, across Africa and worldwide.

> Part 4 of a frontend development roadmap. Deliberately **no database, no backend APIs, no auth and no real payments** — those belong to later projects.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
npx tsc --noEmit # type check
```

## Features

- **Home** — hero section, category grid, featured products, Nigerian/African-made collection, trending products, deal-of-the-week promo, newsletter CTA
- **Products** — full catalogue with URL-driven search (debounced), category filter pills, a Nigerian / African Made collection filter and sorting (price, rating, name); shareable links like `/products?category=fashion&sort=price-asc` or `/products?collection=african-made`
- **Product details** — dynamic route `/products/[id]`, statically generated for every product, with seller attribution linking to the seller's storefront, mock customer reviews, quantity selector, add-to-cart / buy-now, stock states and related products
- **Sellers** — storefront discovery at `/sellers` and statically generated storefronts at `/sellers/[id]` with verified badges, locations, aggregated ratings and each store's full catalogue
- **Categories** — discovery page covering fifteen departments plus the African Made collection
- **Cart** — add/remove items, quantity controls clamped to stock, subtotal/shipping/total in Naira (₦), free-delivery progress bar, persistent across sessions via `localStorage`
- **Wishlist** — save-for-later hearts on product cards and detail pages, dedicated `/wishlist` page, persisted via `localStorage` (`needcentral.wishlist.v1`)
- **Checkout** — simulated frontend-only order flow with delivery options (standard, express, pickup station), Nigeria-default shipping form, order confirmation screen (clearly not a real payment)
- **Order history** — confirmed orders persist to `localStorage` (`needcentral.orders.v1`) and appear at `/orders` with expandable details: items, quantities, prices, totals, status and estimated delivery
- Responsive navigation with live cart badge, loading skeletons, custom 404, empty states, accessible controls

## Routes

| Route | Description |
| --- | --- |
| `/` | Home |
| `/products` | Catalogue (`?q=`, `?category=`, `?collection=`, `?sort=` query params) |
| `/products/[id]` | Product detail (statically generated) |
| `/sellers` | Seller discovery |
| `/sellers/[id]` | Seller storefront (statically generated) |
| `/categories` | Category discovery |
| `/cart` | Shopping cart |
| `/checkout` | Simulated checkout |
| `/orders` | Order history (localStorage) |

## Architecture notes

- **App Router** with server components by default; client components only where interactivity is required (header, toolbar, cart/checkout, purchase panels)
- **Cart state** lives in a small `useSyncExternalStore`-backed store persisted to `localStorage` (`needcentral.cart.v1`), exposed through React context
- **Types** for Product, Category, Seller, Review, CartItem, Cart, Order, OrderItem, Address, DeliveryOption, ProductFilter, SortOption and more live in `types/index.ts`; money is stored in minor units (kobo) so a multi-currency layer can be introduced later; mock data in `lib/data.ts` is structured so PostgreSQL/Prisma can replace it later
- **Images** are locally generated branded SVGs (`scripts/generate-images.mjs` + `lucide-static`) served through `next/image`

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · lucide-react
