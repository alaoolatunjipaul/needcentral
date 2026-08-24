# Vendora — Online Marketplace

A production-quality demo marketplace built with **Next.js (App Router), TypeScript, React and Tailwind CSS**. Browse a curated catalogue, search and filter products, view rich product detail pages and manage a fully client-side shopping cart with a simulated checkout.

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

- **Home** — hero section, category grid, featured products, deal-of-the-week promo, newsletter CTA
- **Products** — full catalogue with URL-driven search (debounced), category filter pills and sorting (price, rating, name); shareable/filterable links like `/products?category=audio&sort=price-asc`
- **Product details** — dynamic route `/products/[id]`, statically generated for every product, with quantity selector, add-to-cart / buy-now, stock states and related products
- **Categories** — discovery page linking into filtered catalogue views
- **Cart** — add/remove items, quantity controls clamped to stock, subtotal/shipping/total, free-shipping progress bar, persistent across sessions via `localStorage`
- **Checkout** — simulated frontend-only order flow with confirmation screen (clearly not a real payment)
- Responsive navigation with live cart badge, loading skeletons, custom 404, empty states, accessible controls

## Routes

| Route | Description |
| --- | --- |
| `/` | Home |
| `/products` | Catalogue (`?q=`, `?category=`, `?sort=` query params) |
| `/products/[id]` | Product detail (statically generated) |
| `/categories` | Category discovery |
| `/cart` | Shopping cart |
| `/checkout` | Simulated checkout |

## Architecture notes

- **App Router** with server components by default; client components only where interactivity is required (header, toolbar, cart/checkout, purchase panels)
- **Cart state** lives in a small `useSyncExternalStore`-backed store persisted to `localStorage` (`vendora.cart.v1`), exposed through React context
- **Types** for Product, Category, CartItem, CartTotals, SortOption and query state live in `types/index.ts`; mock data in `lib/data.ts` is structured so a real database/ORM can replace it later
- **Images** are locally generated branded SVGs (`scripts/generate-images.mjs` + `lucide-static`) served through `next/image`

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · lucide-react
