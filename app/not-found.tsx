import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { btnPrimary, btnSecondary } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <p
        aria-hidden="true"
        className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-8xl font-extrabold tracking-tight text-transparent sm:text-9xl"
      >
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
        This page went out of stock
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500 sm:text-base">
        The page you’re looking for doesn’t exist or may have moved. Let’s get
        you back to the good stuff.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={btnPrimary}>
          <Home aria-hidden="true" className="size-4" />
          Back to home
        </Link>
        <Link href="/products" className={btnSecondary}>
          <Compass aria-hidden="true" className="size-4" />
          Browse products
        </Link>
      </div>
    </div>
  );
}
