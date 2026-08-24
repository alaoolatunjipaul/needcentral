import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
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
  metadataBase: new URL("https://vendora.example.com"),
  title: {
    default: "Vendora · Everyday gear, extraordinary finds",
    template: "%s · Vendora",
  },
  description:
    "Vendora is a modern online marketplace for tech, home and lifestyle. Browse curated products, compare prices and check out in seconds.",
  keywords: [
    "marketplace",
    "online shopping",
    "electronics",
    "home",
    "lifestyle",
    "Vendora",
  ],
  openGraph: {
    title: "Vendora · Everyday gear, extraordinary finds",
    description:
      "A modern online marketplace for tech, home and lifestyle. Free shipping over $75 and 30-day returns.",
    siteName: "Vendora",
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
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
