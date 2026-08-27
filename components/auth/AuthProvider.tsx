"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Customer } from "@/types";

const CUSTOMERS_KEY = "needcentral.customers.v1";
const SESSION_KEY = "needcentral.session.v1";

/** Pre-seeded demo account so visitors can sign in without registering. */
const DEMO_CUSTOMER: Customer = {
  id: "demo-customer",
  name: "Chiamaka O.",
  email: "chiamaka@example.com",
  password: "password123",
};

function isCustomer(value: unknown): value is Customer {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.email === "string" &&
    typeof record.password === "string"
  );
}

function parseStoredCustomers(raw: string | null): Customer[] {
  if (!raw) return [DEMO_CUSTOMER];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [DEMO_CUSTOMER];
    const valid = parsed.filter(isCustomer);
    if (valid.length === 0) return [DEMO_CUSTOMER];
    return valid;
  } catch {
    return [DEMO_CUSTOMER];
  }
}

function parseStoredSession(raw: string | null): string | null {
  if (!raw || raw === "null") return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "string" ? parsed : null;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  customer: Customer | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => string | null;
  signUp: (name: string, email: string, password: string) => string | null;
  signOut: () => void;
}

interface AuthStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => { customers: Customer[]; sessionId: string | null };
  getServerSnapshot: () => { customers: Customer[]; sessionId: string | null };
  updateCustomers: (customers: Customer[]) => void;
  updateSession: (sessionId: string | null) => void;
}

const INITIAL_AUTH_SNAPSHOT = {
  customers: [DEMO_CUSTOMER] as Customer[],
  sessionId: null as string | null,
} as const;

const AuthContext = createContext<AuthContextValue | null>(null);

function createAuthStore(): AuthStore {
  let customers: Customer[] = [DEMO_CUSTOMER];
  let sessionId: string | null = null;
  let restoredFromStorage = false;
  let cachedSnapshot: { customers: Customer[]; sessionId: string | null } | null = null;
  const listeners = new Set<() => void>();

  function restoreOnce() {
    if (restoredFromStorage || typeof window === "undefined") return;
    restoredFromStorage = true;
    try {
      customers = parseStoredCustomers(
        window.localStorage.getItem(CUSTOMERS_KEY)
      );
      sessionId = parseStoredSession(
        window.localStorage.getItem(SESSION_KEY)
      );
    } catch {
      customers = [DEMO_CUSTOMER];
      sessionId = null;
    }
    cachedSnapshot = null;
  }

  function persistCustomers() {
    try {
      window.localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    } catch {
      try {
        window.localStorage.removeItem(CUSTOMERS_KEY);
      } catch {
        return;
      }
    }
  }

  function persistSession() {
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionId));
    } catch {
      try {
        window.localStorage.removeItem(SESSION_KEY);
      } catch {
        return;
      }
    }
  }

  function notify() {
    for (const listener of listeners) listener();
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
      if (
        !cachedSnapshot ||
        cachedSnapshot.customers !== customers ||
        cachedSnapshot.sessionId !== sessionId
      ) {
        cachedSnapshot = { customers, sessionId };
      }
      return cachedSnapshot;
    },
    getServerSnapshot() {
      return INITIAL_AUTH_SNAPSHOT;
    },
    updateCustomers(next) {
      customers = next;
      cachedSnapshot = null;
      persistCustomers();
      notify();
    },
    updateSession(next) {
      sessionId = next;
      cachedSnapshot = null;
      persistSession();
      notify();
    },
  };
}

const authStore = createAuthStore();

export function AuthProvider({ children }: { children: ReactNode }) {
  const { customers, sessionId } = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getServerSnapshot
  );

  const customer = useMemo(
    () => (sessionId ? customers.find((c) => c.id === sessionId) ?? null : null),
    [customers, sessionId]
  );

  const signIn = useCallback(
    (email: string, password: string): string | null => {
      const trimmed = email.trim().toLowerCase();
      const found = customers.find(
        (c) => c.email.toLowerCase() === trimmed && c.password === password
      );
      if (!found) return "Invalid email or password.";
      authStore.updateSession(found.id);
      return null;
    },
    [customers]
  );

  const signUp = useCallback(
    (name: string, email: string, password: string): string | null => {
      const trimmed = email.trim().toLowerCase();
      if (customers.some((c) => c.email.toLowerCase() === trimmed)) {
        return "An account with this email already exists.";
      }
      const newCustomer: Customer = {
        id: `customer-${Date.now().toString(36)}`,
        name: name.trim(),
        email: trimmed,
        password,
      };
      authStore.updateCustomers([...customers, newCustomer]);
      authStore.updateSession(newCustomer.id);
      return null;
    },
    [customers]
  );

  const signOut = useCallback(() => {
    authStore.updateSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      isAuthenticated: customer !== null,
      signIn,
      signUp,
      signOut,
    }),
    [customer, signIn, signUp, signOut]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
