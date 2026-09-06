import Link from "next/link";
import { LayoutDashboard, Package, Store } from "lucide-react";
import type { ReactNode } from "react";

// Shared shell for the seller self-service area (/seller). The nav is
// intentionally minimal — dashboard, listings, store profile.

const TABS = [
  { href: "/seller", label: "Overview", icon: LayoutDashboard },
  { href: "/seller/listings", label: "Listings", icon: Package },
  { href: "/seller/store", label: "Store profile", icon: Store },
] as const;

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <nav
        aria-label="Seller dashboard"
        className="mb-8 flex flex-wrap items-center gap-2"
      >
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <tab.icon aria-hidden="true" className="size-4" />
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}