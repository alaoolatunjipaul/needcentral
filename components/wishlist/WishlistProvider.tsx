"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Product, WishlistItem } from "@/types";

const STORAGE_KEY = "needcentral.wishlist.v1";
const EMPTY_ITEMS: WishlistItem[] = [];

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  isSaved: (productId: string) => boolean;
  toggle: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

function isWishlistItem(value: unknown): value is WishlistItem {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.productId === "string" &&
    typeof record.name === "string" &&
    typeof record.image === "string" &&
    typeof record.priceCents === "number" &&
    Number.isFinite(record.priceCents)
  );
}

function parseStoredItems(raw: string | null): WishlistItem[] {
  if (!raw) return EMPTY_ITEMS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_ITEMS;
    const seen = new Set<string>();
    return parsed.filter((item) => {
      if (!isWishlistItem(item) || seen.has(item.productId)) return false;
      seen.add(item.productId);
      return true;
    });
  } catch {
    return EMPTY_ITEMS;
  }
}

interface WishlistStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => WishlistItem[];
  getServerSnapshot: () => WishlistItem[];
  update: (transform: (prev: WishlistItem[]) => WishlistItem[]) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function createWishlistStore(): WishlistStore {
  let items: WishlistItem[] = EMPTY_ITEMS;
  let restoredFromStorage = false;
  const listeners = new Set<() => void>();

  function restoreOnce() {
    if (restoredFromStorage || typeof window === "undefined") return;
    restoredFromStorage = true;
    try {
      items = parseStoredItems(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      items = EMPTY_ITEMS;
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        return;
      }
    }
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      restoreOnce();
      return items;
    },
    getServerSnapshot() {
      return EMPTY_ITEMS;
    },
    update(transform) {
      items = transform(items);
      persist();
      for (const listener of listeners) listener();
    },
  };
}

const wishlistStore = createWishlistStore();

export function WishlistProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot
  );

  const savedIds = useMemo(
    () => new Set(items.map((item) => item.productId)),
    [items]
  );

  const isSaved = useCallback(
    (productId: string) => savedIds.has(productId),
    [savedIds]
  );

  const toggle = useCallback((product: Product) => {
    wishlistStore.update((prev) => {
      if (prev.some((item) => item.productId === product.id)) {
        return prev.filter((item) => item.productId !== product.id);
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          image: product.image,
          priceCents: product.priceCents,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    wishlistStore.update((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  }, []);

  const clearWishlist = useCallback(() => {
    wishlistStore.update(() => EMPTY_ITEMS);
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      isSaved,
      toggle,
      removeItem,
      clearWishlist,
    }),
    [items, isSaved, toggle, removeItem, clearWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
