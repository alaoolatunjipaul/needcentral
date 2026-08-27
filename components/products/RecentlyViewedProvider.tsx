"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "needcentral.recently-viewed.v1";
const EMPTY_IDS: string[] = [];

/** Sensible cap so the rail stays fresh without growing forever. */
export const MAX_RECENTLY_VIEWED = 12;

interface RecentlyViewedContextValue {
  recentlyViewedIds: string[];
  hasHistory: boolean;
  recordProductView: (productId: string) => void;
  clearRecentlyViewed: () => void;
}

function parseStoredIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

interface RecentlyViewedStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => string[];
  getServerSnapshot: () => string[];
  update: (next: string[]) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(
  null
);

function createRecentlyViewedStore(): RecentlyViewedStore {
  let productIds: string[] = [];
  let restoredFromStorage = false;
  const listeners = new Set<() => void>();

  function restoreOnce() {
    if (restoredFromStorage || typeof window === "undefined") return;
    restoredFromStorage = true;
    try {
      productIds = parseStoredIds(
        window.localStorage.getItem(STORAGE_KEY)
      );
    } catch {
      productIds = [];
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
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
      return productIds;
    },
    getServerSnapshot() {
      return EMPTY_IDS;
    },
    update(next) {
      productIds = next;
      persist();
      for (const listener of listeners) listener();
    },
  };
}

const recentlyViewedStore = createRecentlyViewedStore();

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const recentlyViewedIds = useSyncExternalStore(
    recentlyViewedStore.subscribe,
    recentlyViewedStore.getSnapshot,
    recentlyViewedStore.getServerSnapshot
  );

  /**
   * Most recent first, duplicates collapse into a single entry, oldest
   * entries fall off past the maximum.
   */
  const recordProductView = useCallback((productId: string) => {
    const current = recentlyViewedStore.getSnapshot();
    const next = [
      productId,
      ...current.filter((id) => id !== productId),
    ].slice(0, MAX_RECENTLY_VIEWED);
    if (next.length === current.length && next[0] === current[0]) {
      return;
    }
    recentlyViewedStore.update(next);
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    recentlyViewedStore.update([]);
  }, []);

  const value = useMemo<RecentlyViewedContextValue>(
    () => ({
      recentlyViewedIds,
      hasHistory: recentlyViewedIds.length > 0,
      recordProductView,
      clearRecentlyViewed,
    }),
    [recentlyViewedIds, recordProductView, clearRecentlyViewed]
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed(): RecentlyViewedContextValue {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error(
      "useRecentlyViewed must be used within a RecentlyViewedProvider"
    );
  }
  return context;
}
