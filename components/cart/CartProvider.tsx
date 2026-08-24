"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types";

const STORAGE_KEY = "needcentral.cart.v1";
const EMPTY_ITEMS: CartItem[] = [];

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addItem: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.productId === "string" &&
    typeof record.name === "string" &&
    typeof record.image === "string" &&
    typeof record.priceCents === "number" &&
    Number.isFinite(record.priceCents) &&
    typeof record.quantity === "number" &&
    Number.isInteger(record.quantity) &&
    record.quantity > 0 &&
    typeof record.maxQuantity === "number" &&
    Number.isInteger(record.maxQuantity) &&
    record.maxQuantity > 0
  );
}

function parseStoredItems(raw: string | null): CartItem[] {
  if (!raw) return EMPTY_ITEMS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_ITEMS;
    return parsed.filter(isCartItem);
  } catch {
    return EMPTY_ITEMS;
  }
}

interface CartStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => CartItem[];
  getServerSnapshot: () => CartItem[];
  update: (transform: (prev: CartItem[]) => CartItem[]) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function createCartStore(): CartStore {
  let items: CartItem[] = EMPTY_ITEMS;
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

const cartStore = createCartStore();

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  const addItem = useCallback((product: Product, quantity = 1) => {
    if (product.stock <= 0 || quantity <= 0) return;
    cartStore.update((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, product.stock),
              }
            : item
        );
      }
      const nextItem: CartItem = {
        productId: product.id,
        name: product.name,
        image: product.image,
        priceCents: product.priceCents,
        quantity: Math.min(quantity, product.stock),
        maxQuantity: product.stock,
      };
      return [...prev, nextItem];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    cartStore.update((prev) =>
      prev.flatMap((item) => {
        if (item.productId !== productId) return [item];
        const clamped = Math.min(Math.max(quantity, 1), item.maxQuantity);
        return [{ ...item, quantity: clamped }];
      })
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    cartStore.update((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  }, []);

  const clearCart = useCallback(() => {
    cartStore.update(() => EMPTY_ITEMS);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [items, addItem, setQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
