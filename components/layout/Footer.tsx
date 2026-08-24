import Link from "next/link";
import { categories } from "@/lib/data";
import { containerClass } from "@/lib/ui";

const SHOP_LINKS = categories.slice(0, 4).map((category) => ({
  href: `/products?category=${category.id}`,
  label: category.name,
}));

const SITE_LINKS = [
  { href: "/products", label: "All products" },
  { href: "/categories", label: "All categories" },
  { href: "/cart", label: "Your cart" },
  { href: "/checkout", label: "Checkout" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className={containerClass}>
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2" aria-label="Vendora home">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-500 text-lg font-extrabold text-white"
              >
                V
              </span>
              <span className="text-lg font-bold tracking-tight">Vendora</span>
            </Link>
            <p className="max-w-xs text-sm leading-6 text-zinc-500">
              A modern marketplace for everyday gear and extraordinary finds,
              curated across tech, home and lifestyle.
            </p>
          </div>

          <nav aria-label="Shop by category">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
              Shop
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 transition hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Site pages">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SITE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 transition hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
              Why Vendora
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-zinc-500">
              <li>Free shipping over $75</li>
              <li>30-day easy returns</li>
              <li>2-year warranty on all tech</li>
              <li>Human customer support</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-200 py-6 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Vendora. All rights reserved.</p>
          <p>Demo marketplace built with Next.js, TypeScript &amp; Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
