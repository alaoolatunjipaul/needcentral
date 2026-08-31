import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { CouponProvider } from "@/components/coupons/CouponProvider";
import { OrdersProvider } from "@/components/orders/OrdersProvider";
import { RecentlyViewedProvider } from "@/components/products/RecentlyViewedProvider";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SessionHeader } from "@/components/layout/SessionHeader";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://needcentral.example.com"),
  title: {
    default: "NeedCentral · A global marketplace born in Nigeria",
    template: "%s · NeedCentral",
  },
  description:
    "NeedCentral is a global marketplace born in Nigeria — shop electronics, fashion, beauty, food and African-made goods from individuals, businesses, brands and creators, with fast delivery and buyer protection.",
  keywords: [
    "marketplace",
    "global marketplace",
    "online shopping",
    "Nigeria",
    "African made",
    "electronics",
    "fashion",
    "groceries",
    "NeedCentral",
  ],
  openGraph: {
    title: "NeedCentral · A global marketplace born in Nigeria",
    description:
      "The global marketplace born in Nigeria — proudly African roots, open to sellers and shoppers everywhere. Free standard delivery over ₦75,000 and 30-day returns.",
    siteName: "NeedCentral",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <OrdersProvider>
                <CouponProvider>
                  <RecentlyViewedProvider>
                    <Suspense
                      fallback={
                        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
                          <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                            <span className="flex shrink-0 items-center gap-2">
                              <span
                                aria-hidden="true"
                                className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-500 text-lg font-extrabold text-white"
                              >
                                N
                              </span>
                              <span className="text-lg font-bold tracking-tight">
                                NeedCentral
                              </span>
                            </span>
                            <div className="ml-auto h-9 w-44 animate-pulse rounded-full bg-zinc-100" />
                          </div>
                        </header>
                      }
                    >
                      <SessionHeader />
                    </Suspense>
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </RecentlyViewedProvider>
                </CouponProvider>
              </OrdersProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
