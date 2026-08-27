import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { CouponProvider } from "@/components/coupons/CouponProvider";
import { OrdersProvider } from "@/components/orders/OrdersProvider";
import { RecentlyViewedProvider } from "@/components/products/RecentlyViewedProvider";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
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
                    <Header />
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
