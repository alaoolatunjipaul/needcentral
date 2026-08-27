"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Heart, LogOut, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/products?collection=african-made", label: "African Made" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { count: savedCount } = useWishlist();
  const { customer, isAuthenticated, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = mobileQuery.trim();
    router.push(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : "/products");
    setMobileQuery("");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="NeedCentral home">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-500 text-lg font-extrabold text-white"
          >
            N
          </span>
          <span className="text-lg font-bold tracking-tight">NeedCentral</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
                    isActive(pathname, link.href)
                      ? "bg-brand-50 text-brand-700"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <form
          role="search"
          className="ml-auto hidden max-w-sm flex-1 items-center md:flex"
          onSubmit={(event) => {
            event.preventDefault();
            const value = (event.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
            router.push(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
          }}
        >
          <label htmlFor="header-search-desktop" className="sr-only">
            Search products
          </label>
          <div className="relative w-full">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
            />
            <input
              id="header-search-desktop"
              name="q"
              type="search"
              autoComplete="off"
              placeholder="Search products…"
              className="w-full rounded-full border border-transparent bg-zinc-100 py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            href="/wishlist"
            aria-label={`Saved items${savedCount > 0 ? `, ${savedCount} saved` : ""}`}
            className="relative grid size-10 place-items-center rounded-full text-zinc-700 transition hover:bg-zinc-100 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <Heart aria-hidden="true" className="size-5" />
            {savedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-bold leading-5 text-white ring-2 ring-white">
                {savedCount > 99 ? "99+" : savedCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart${itemCount > 0 ? `, ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}`}
            className="relative grid size-10 place-items-center rounded-full text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <ShoppingBag aria-hidden="true" className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold leading-5 text-white ring-2 ring-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated && customer ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/account"
                aria-label={`Account: ${customer.name}`}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100"
                >
                  {customer.name.charAt(0)}
                </span>
                <span className="max-w-[8rem] truncate">{customer.name}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                aria-label="Sign out"
                className="grid size-8 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <LogOut aria-hidden="true" className="size-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              aria-label="Sign in"
              className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-50 hover:text-zinc-900 hover:ring-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 md:inline-flex"
            >
              <User aria-hidden="true" className="size-4" />
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-full text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 md:hidden"
          >
            {menuOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-zinc-200 bg-white md:hidden">
          <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-4 sm:px-6">
            <form role="search" onSubmit={submitSearch}>
              <label htmlFor="header-search-mobile" className="sr-only">
                Search products
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                />
                <input
                  id="header-search-mobile"
                  type="search"
                  autoComplete="off"
                  value={mobileQuery}
                  onChange={(event) => setMobileQuery(event.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </form>
            <nav aria-label="Mobile navigation">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive(pathname, link.href) ? "page" : undefined}
                      className={cn(
                        "block rounded-xl px-4 py-2.5 text-base font-medium transition",
                        isActive(pathname, link.href)
                          ? "bg-brand-50 text-brand-700"
                          : "text-zinc-700 hover:bg-zinc-100"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-zinc-100 pt-4">
              {isAuthenticated && customer ? (
                <div className="space-y-2">
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-base font-medium text-zinc-700 transition hover:bg-zinc-100"
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100"
                    >
                      {customer.name.charAt(0)}
                    </span>
                    <span className="truncate">{customer.name}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                      router.push("/");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-base font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut aria-hidden="true" className="size-5" />
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-base font-medium text-zinc-700 transition hover:bg-zinc-100"
                >
                  <User aria-hidden="true" className="size-5" />
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
