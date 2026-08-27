"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Order } from "@/types";

const STORAGE_KEY = "needcentral.orders.v1";
/** Keep the most recent simulated orders so localStorage never grows unbounded. */
const MAX_ORDERS = 20;
const EMPTY_ORDERS: Order[] = [];

interface OrdersContextValue {
  orders: Order[];
  count: number;
  addOrder: (order: Order) => void;
}

function isOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.email === "string" &&
    Array.isArray(record.items) &&
    typeof record.subtotalCents === "number" &&
    Number.isFinite(record.subtotalCents) &&
    typeof record.shippingCents === "number" &&
    Number.isFinite(record.shippingCents) &&
    typeof record.totalCents === "number" &&
    Number.isFinite(record.totalCents) &&
    typeof record.status === "string" &&
    typeof record.deliveryOptionId === "string" &&
    typeof record.placedAtISO === "string" &&
    typeof record.estimatedDeliveryISO === "string"
  );
}

function parseStoredOrders(raw: string | null): Order[] {
  if (!raw) return EMPTY_ORDERS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_ORDERS;
    return parsed.filter(isOrder);
  } catch {
    return EMPTY_ORDERS;
  }
}

interface OrdersStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => Order[];
  getServerSnapshot: () => Order[];
  update: (transform: (prev: Order[]) => Order[]) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

function createOrdersStore(): OrdersStore {
  let orders: Order[] = EMPTY_ORDERS;
  let restoredFromStorage = false;
  const listeners = new Set<() => void>();

  function restoreOnce() {
    if (restoredFromStorage || typeof window === "undefined") return;
    restoredFromStorage = true;
    try {
      orders = parseStoredOrders(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      orders = EMPTY_ORDERS;
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
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
      return orders;
    },
    getServerSnapshot() {
      return EMPTY_ORDERS;
    },
    update(transform) {
      orders = transform(orders);
      persist();
      for (const listener of listeners) listener();
    },
  };
}

const ordersStore = createOrdersStore();

export function OrdersProvider({ children }: { children: ReactNode }) {
  const orders = useSyncExternalStore(
    ordersStore.subscribe,
    ordersStore.getSnapshot,
    ordersStore.getServerSnapshot
  );

  const addOrder = useCallback((order: Order) => {
    ordersStore.update((prev) =>
      [order, ...prev.filter((existing) => existing.id !== order.id)].slice(
        0,
        MAX_ORDERS
      )
    );
  }, []);

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders,
      count: orders.length,
      addOrder,
    }),
    [orders, addOrder]
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders(): OrdersContextValue {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
