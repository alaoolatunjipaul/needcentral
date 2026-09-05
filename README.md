# NeedCentral

## Project description

NeedCentral is a modern marketplace / e-commerce **frontend** built with **Next.js (App Router), TypeScript, React and Tailwind CSS**. It is designed around a realistic customer shopping journey and marketplace experience: users can browse and discover a curated global catalogue (with a signature Nigerian / African-made collection), evaluate products through rich detail pages with reviews and Q&A, manage a fully client-side cart and coupon, and complete a simulated checkout with delivery or pickup options.

The storefront presents NeedCentral as a global marketplace born in Nigeria — starting with Nigerian sellers, prices and logistics, proudly showcasing African makers, and structured so individual sellers, small businesses, brands and creators can each have their own storefront.

## Project purpose

This project demonstrates the ability to **design, build, structure, test and ship a production-quality frontend marketplace experience** — from information architecture and discovery, through a complete purchase flow, to retention features — entirely within a typed, component-based frontend stack, while keeping a clear separation between what is implemented today and what belongs to later infrastructure stages.

## Technology stack

Verified directly from the repository (`package.json`, source and config):

- **Next.js** (16.3.2) — App Router, React Server Components by default, static-site / SSG generation
- **React** (19.2.8)
- **TypeScript** (5.x)
- **Tailwind CSS** (v4) for styling
- **lucide-react** for icons
- **Client-side state + `localStorage`** for cart, coupon, wishlist, orders, reviews, Q&A, auth session, subject to component providers
- **Git / GitHub** for version control and remote hosting
- No deployment platform (e.g. Vercel) is configured or claimed in this repository

## Completed features

All features below are implemented and verified in the current repository:

- **Marketplace / product discovery** — URL-driven search (debounced), category filter pills, a Nigerian / African-made collection filter, and sorting (price, rating, name) with shareable URLs such as `/products?category=fashion&sort=price-asc`
- **Product catalogue** — `/products` with filtering, search, sorting and result counts
- **Categories** — discovery page covering fifteen departments plus the African-made collection
- **Product details** — `/products/[id]`, statically generated for every product, with rating summary, mock + user-submitted reviews, product Q&A, quantity selector, add-to-cart / buy-now, stock states, related products and recently-viewed rail
- **Sellers and seller storefronts** — `/sellers` index and statically generated storefronts at `/sellers/[id]` with verified badges, location, aggregated ratings, store statistics and each store's full catalogue
- **Cart** — add / remove items, quantity controls clamped to stock, subtotal / shipping / total in Naira (₦), free-delivery progress bar, persisted across sessions via `localStorage`
- **Checkout** — simulated frontend-only order flow
- **Coupons** — promo codes (e.g. WELCOME10, NAIJA15) applied/removed via Enter or button, one active coupon per order, minimum-spend logic
- **Delivery options** — standard and express delivery with ETA and cross-border handling
- **Pickup stations** — choose a pickup station instead of a shipping address; confirmation shows the chosen station
- **Orders / order history** — confirmed orders persist to `localStorage` and appear at `/orders` with items, quantities, prices, totals, status and estimated delivery
- **Wishlist** — save-for-later hearts on product cards and detail pages, dedicated `/wishlist` page, persisted via `localStorage`
- **Recently viewed products** — a "recently viewed" rail on the home page, persisted client-side, with a clear-history control
- **Sign-in / sign-up / account frontend experience** — simulated auth UI (no real backend), with an account gate for profile, orders, wishlist and sign-out
- **Product Q&A** — ask and answer questions per product, persisted client-side
- **Product reviews** — mock + user-submitted reviews with star ratings
- **Review photo uploads** — attach photos to a review (client-side, size / count limits)
- **Responsive / mobile experience** — layouts adapt down to mobile widths with a mobile navigation menu
- **Accessibility improvements** — semantic HTML, labels / aria-labels, focus-visible outlines, `aria-live` quantity steppers, keyboard friendly controls
- **Loading and empty states** — skeleton loading states and friendly empty/not-found results
- **404 / not-found experience** — branded custom 404 page
- **NeedCentral branding/favicon** — branded `app/icon.svg` favicon

## Customer journey

The fully supported flow is:

**Browse / discover → Product → Cart → Checkout → Delivery or Pickup → Order confirmation → Orders**

- Start on the home page (featured, trending, African-made) or use the catalogue / category / seller / search routes to discover products.
- Open a product detail page to evaluate it via reviews, Q&A, star ratings, stock state and related products; save it for later with the wishlist, or rely on the recently-viewed rail to return to it.
- Add items to the cart, adjust quantities, and apply a promo code in the cart.
- At checkout choose **delivery** (standard / express) or a **pickup station**, review the totals with any discount, and place the (simulated) order.
- See the order confirmation with its order number, then view the full history at `/orders`.

## Marketplace experience

NeedCentral models a multi-seller marketplace in the frontend:

- Each **product** belongs to a **seller** (`lib/data.ts`), and a product detail page attributes it to that seller with a link to their storefront.
- Each **seller** (`/sellers/[id]`) has a verified badge, location, aggregate product rating, review count, store statistics and its own full catalogue.
- Sellers can be neighbourhood artisans and farms rooted in Nigeria and Ghana alongside studios and brands from around the world, represented through the Nigerian / African-made collection and cross-border delivery handling.
- The idea is a credible "many sellers, one storefront" experience — with buy protection / returns messaging — rather than a single-brand demo page.

## Architecture / current project boundary

This project started as a **frontend marketplace application using simulated / client-side persistence** where applicable. Successive roadmap stages have since added real server-side infrastructure:

- `Prisma` + PostgreSQL runs the core catalogue (categories, sellers, products) and order history.
- Production authentication is live: real accounts, password hashing and httpOnly server-side sessions (`lib/auth-service.ts`).
- A backend exists as Server Actions, server pages and API route handlers (including the Paystack webhook and `/api/*` catalogue/order endpoints).
- Payment gateway integration is complete (Paystack TEST mode checkout) — see the stage log below.

This section is no longer an exhaustive "not implemented" list. Remaining future infra (microservices, real logistics providers, automated refunds, seller self-service) is tracked in "Future / later stages".

## Quality / engineering

Verified quality work in this repository:

- **TypeScript validation** — `npx tsc --noEmit` passes
- **ESLint** — `npm run lint` passes
- **Production builds** — `npm run build` succeeds
- **Successful generation of all 71 pages** — confirmed by the current production build (71 static pages generated)
- **Responsive behavior** — layouts adapt to mobile widths with a mobile menu
- **Accessibility** — semantic HTML, labels / aria-labels, keyboard / focus behavior, `aria-live` steppers
- **Loading / empty / error handling** — skeleton loading states, empty states, branded 404
- **Checkout regression testing** — checkout, coupon, delivery and pickup flows verified end to end
- **Removal of the nested coupon form React warning** — the `CouponPanel` previously rendered a `<form>` inside the checkout `<form>`; this was fixed and committed (`99d78d5 fix: remove nested coupon form in checkout`), and no nested-form or hydration warnings remain in the browser console

Note: this project does not currently include an automated unit / integration / end-to-end test suite; verification was performed by type-check, lint, production build and manual/browser regression checks.

## Running locally

The following scripts are defined in `package.json` and can be run after installing dependencies:

```bash
npm install
npm run dev      # start the development server at http://localhost:3000
npm run lint     # run ESLint
npm run build    # create an optimized production build
```

(`npm run start` is also available from `package.json` to serve the production build locally.)

## Project structure

- **`app/`** — Next.js App Router routes and pages (home, products, product detail, categories, sellers, seller storefront, cart, checkout, orders, wishlist, account, sign-in, sign-up, not-found) plus `layout.tsx`, `globals.css` and the branded `icon.svg` favicon
- **`components/`** — reusable UI in feature folders (`home`, `products`, `cart`, `coupons`, `orders`, `wishlist`, `sellers`, `auth`, `layout`) including providers for cart, coupon, orders, wishlist, recently-viewed and auth
- **`lib/`** — data (`data.ts`), utilities (`utils.ts`), shared UI helpers (`ui.ts`) and category icons
- **`types/`** — shared TypeScript types (Product, Category, Seller, Review, CartItem, Cart, Order, Address, DeliveryOption, and more)
- **`public/`** — static / image assets served by the app

## Project status

**NeedCentral Project 4 — COMPLETE.**

This project is complete within its agreed scope: a Next.js + TypeScript frontend marketplace experience with a fully working simulated shopping journey. All application functionality is implemented and verified; the repository is clean and `main` is synchronized with `origin/main`.

## Roadmap position

NeedCentral sits at the transition from pure frontend work into full-stack territory. Verified technology progression across the related projects:

- **Project 1** — HTML, CSS, JavaScript
- **Project 2** — React, Tailwind CSS, Framer Motion
- **Project 3** — Next.js + TypeScript / full frontend application stage
- **Project 4 (this project)** — NeedCentral: a Next.js + TypeScript frontend marketplace

Later stages (not implemented here) would add:

- PostgreSQL
- Authentication
- Backend / API
- Microservices
- Mobile / desktop technologies

## Future / later stages

Stuff clearly distinguished from the current implementation — none of the following exist in this repository today and they are listed only as future direction:

- Buyer protection, returns and shipping logistics — **currently in progress as roadmap stage #5** (approved scope documented below)
- Seller self-service sign-up and listing management
- Automated end-to-end test coverage
- Deployment configuration (e.g. Vercel)
- Microservices
- Real logistics / carrier integration and automated (autonomous) refund processing

These are future infra/scope items, not commitments bundled into this stage.

## Roadmap stage log

### Stage: Payment Gateway Integration — COMPLETE

Paystack (TEST mode) checkout was integrated and verified:
- Server-side order assembly and validation (`app/checkout/actions.ts`) — every price is re-read from the catalogue; no client-supplied totals are trusted.
- Paystack hosted Standard checkout (`lib/paystack.ts` initialize → authorization URL → callback → verify), with an HMAC-SHA512 webhook fallback (`app/api/webhooks/paystack/route.ts`).
- Orders persist to PostgreSQL as `pending` and are only marked `confirmed` after a verified transaction with a matching amount (`lib/payment-verify.ts`, `lib/orders-data.ts` `markOrderPaid`).
- No card data, CVV or credentials are handled or stored anywhere.

### Stage: Buyer protection, returns and shipping logistics (#5) — IN PROGRESS

Approved scope (decisions locked, implemented under this stage only):

- **Returns record + manual refund:** requesting a return records the request, and an approved return creates a `Refund Pending Manual` state. No Paystack refund is auto-initiated in this stage (automated refunds remain future work).
- **No seller self-service:** no seller authentication/dashboard is built. Fulfillment advancement (`shipped` / `delivered`) is simulated through the existing buyer / order-owner flow for this stage.
- **Static tracking numbers:** NeedCentral generates static shipment tracking numbers. No carrier or logistics-provider integration.
- **Return policy (enforced server-side):** an order must be eligible (delivered/confirmed) and the return must be requested within 30 days of delivery/confirmation.
- **Boundary:** strictly #5. No seller self-service (#6), no automated refund integration, no external logistics provider, no microservices.

Implementation is additive: new Prisma models/fields + a migration applied with `prisma migrate` against the existing database — no resets, drops, destructive migrations or reseeding.

## Design / product philosophy

The goal of this project is a **credible marketplace experience** rather than a simple demo page:

- **Clear discovery** — URL-driven search, category and collection browsing, and seller-driven navigation
- **Trustworthy product evaluation** — ratings, reviews with photos, Q&A, stock states and transparent seller context
- **Transparent checkout** — a clear, simulated flow with visible totals, discounts and delivery / pickup choices
- **Seller context** — every product is tied to a real-looking seller and storefront
- **Customer retention features** — wishlist, recently-viewed, order history and an account experience
- **Responsive and accessible experience** — mobile-first layouts, semantic HTML, keyboard and screen-reader friendly controls

NeedCentral is presented as a credible marketplace experience; payments run in Paystack **TEST mode** only (no real transaction is charged), and this is not a real, operating commercial marketplace.
