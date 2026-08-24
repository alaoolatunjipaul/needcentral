import Link from "next/link";
import { categories } from "@/lib/data";
import { FREE_SHIPPING_THRESHOLD_CENTS, formatPrice } from "@/lib/utils";
import { containerClass } from "@/lib/ui";

const SHOP_LINKS = categories.slice(0, 4).map((category) => ({
  href: `/products?category=${category.id}`,
  label: category.name,
}));

const SITE_LINKS = [
  { href: "/products", label: "All products" },
  { href: "/categories", label: "All categories" },
  { href: "/products?collection=african-made", label: "Nigerian / African Made" },
  { href: "/cart", label: "Your cart" },
  { href: "/checkout", label: "Checkout" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className={containerClass}>
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2" aria-label="NeedCentral home">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-500 text-lg font-extrabold text-white"
              >
                N
              </span>
              <span className="text-lg font-bold tracking-tight">NeedCentral</span>
            </Link>
            <p className="max-w-xs text-sm leading-6 text-zinc-500">
              A global marketplace born in Nigeria — where individuals, small
              businesses, brands and creators reach customers at home, across
              Africa and around the world.
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
              Why NeedCentral
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-zinc-500">
              <li>Free standard delivery over {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)}</li>
              <li>30-day easy returns</li>
              <li>Buyer protection on every order</li>
              <li>Human customer support</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-200 py-6 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 NeedCentral. All rights reserved.</p>
          <p>Born in Nigeria. Open to the world · Built with Next.js, TypeScript &amp; Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
