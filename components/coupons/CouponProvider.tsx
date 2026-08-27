"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Coupon } from "@/types";

const STORAGE_KEY = "needcentral.coupon.v1";

interface CouponContextValue {
  coupon: Coupon | null;
  hasCoupon: boolean;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
}

function isCoupon(value: unknown): value is Coupon {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.code === "string" &&
    typeof record.description === "string"
  );
}

function parseStoredCoupon(raw: string | null): Coupon | null {
  if (!raw || raw === "null") return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isCoupon(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

interface CouponStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => Coupon | null;
  getServerSnapshot: () => Coupon | null;
  update: (next: Coupon | null) => void;
}

const CouponContext = createContext<CouponContextValue | null>(null);

function createCouponStore(): CouponStore {
  let coupon: Coupon | null = null;
  let restoredFromStorage = false;
  const listeners = new Set<() => void>();

  function restoreOnce() {
    if (restoredFromStorage || typeof window === "undefined") return;
    restoredFromStorage = true;
    try {
      coupon = parseStoredCoupon(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      coupon = null;
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coupon));
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
      return coupon;
    },
    getServerSnapshot() {
      return null;
    },
    update(next) {
      coupon = next;
      persist();
      for (const listener of listeners) listener();
    },
  };
}

const couponStore = createCouponStore();

export function CouponProvider({ children }: { children: ReactNode }) {
  const coupon = useSyncExternalStore(
    couponStore.subscribe,
    couponStore.getSnapshot,
    couponStore.getServerSnapshot
  );

  const applyCoupon = useCallback((next: Coupon) => {
    couponStore.update(next);
  }, []);

  const removeCoupon = useCallback(() => {
    couponStore.update(null);
  }, []);

  const value = useMemo<CouponContextValue>(
    () => ({
      coupon,
      hasCoupon: coupon !== null,
      applyCoupon,
      removeCoupon,
    }),
    [coupon, applyCoupon, removeCoupon]
  );

  return (
    <CouponContext.Provider value={value}>{children}</CouponContext.Provider>
  );
}

export function useCoupons(): CouponContextValue {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error("useCoupons must be used within a CouponProvider");
  }
  return context;
}
