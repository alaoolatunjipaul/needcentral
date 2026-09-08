import { afterEach, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { createAppServer, type AppDeps } from "./server.js";
import { createStore, type NotificationStore } from "./store.js";
import { createDevTransport } from "./transport.js";

const TOKEN = "test-token";

const openServers: Server[] = [];
const openStores: NotificationStore[] = [];

function deps(overrides: Partial<AppDeps> = {}): AppDeps {
  return {
    config: { token: TOKEN },
    store: createStore(":memory:"),
    transport: createDevTransport({ log: () => {} }),
    ...overrides,
  };
}

async function startServer(deps: AppDeps): Promise<string> {
  const server = createAppServer(deps);
  openServers.push(server);
  await new Promise<void>((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve())
  );
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("no port bound");
  return `http://127.0.0.1:${address.port}`;
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    eventId: "order.confirmed:NC-TEST-1",
    type: "order.confirmed",
    userId: "user_1",
    channels: ["email"],
    payload: { orderId: "NC-TEST-1", totalCents: 1000 },
    ...overrides,
  };
}

async function post(
  base: string,
  body: unknown,
  token: string | null = TOKEN
): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token !== null) headers.Authorization = `Bearer ${token}`;
  return fetch(`${base}/v1/notifications`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  for (const server of openServers) server.close();
  openServers.length = 0;
  for (const store of openStores) {
    try {
      store.close();
    } catch {
      // already closed
    }
  }
  openStores.length = 0;
});

describe("GET /v1/health", () => {
  it("returns 200 without authentication", async () => {
    const base = await startServer(deps());
    const res = await fetch(`${base}/v1/health`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.service).toBe("notification-service");
  });
});

describe("POST /v1/notifications", () => {
  it("rejects requests without a token (401)", async () => {
    const base = await startServer(deps());
    const res = await post(base, validBody(), null);
    expect(res.status).toBe(401);
  });

  it("rejects requests with a wrong token (401)", async () => {
    const base = await startServer(deps());
    const res = await post(base, validBody(), "wrong-token");
    expect(res.status).toBe(401);
  });

  it("creates and delivers a valid notification (201)", async () => {
    const store = deps().store;
    openStores.push(store);
    const base = await startServer(deps({ store }));
    const res = await post(base, validBody());
    expect(res.status).toBe(201);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.duplicate).toBe(false);
    const notification = body.notification as Record<string, unknown>;
    expect(notification.eventId).toBe("order.confirmed:NC-TEST-1");
    expect(notification.status).toBe("delivered");
    expect(notification.deliveredAtISO).toBeTruthy();
    expect(store.countAll()).toBe(1);
  });

  it("is idempotent for a duplicate eventId (200)", async () => {
    const store = deps().store;
    openStores.push(store);
    const base = await startServer(deps({ store }));

    const first = await post(base, validBody());
    expect(first.status).toBe(201);
    const created = (await first.json()) as { notification: { id: string } };

    const second = await post(base, validBody());
    expect(second.status).toBe(200);
    const body = (await second.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.duplicate).toBe(true);
    expect((body.notification as { id: string }).id).toBe(created.notification.id);
    expect(store.countAll()).toBe(1);
  });

  it("rejects invalid payloads (400)", async () => {
    const base = await startServer(deps());
    const cases = [
      validBody({ eventId: "" }),
      validBody({ type: "unknown.event" }),
      validBody({ userId: "" }),
      validBody({ channels: ["telegram"] }),
      validBody({ payload: "not-an-object" }),
      { eventId: 42 },
      "plain string",
    ];
    for (const body of cases) {
      const res = await post(base, body);
      expect(res.status).toBe(400);
    }
  });

  it("rejects oversized request bodies (400)", async () => {
    const base = await startServer(deps());
    const res = await fetch(`${base}/v1/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: `[${" ".repeat(1_100_000)}]`,
    });
    expect(res.status).toBe(400);
  });

  it("accepts the enqueue even when delivery fails and records a failed status", async () => {
    const failingTransport = {
      deliver: async () => {
        throw new Error("provider down");
      },
    };
    const store = deps().store;
    openStores.push(store);
    const base = await startServer(deps({ store, transport: failingTransport }));

    const res = await post(base, validBody());
    expect(res.status).toBe(201);
    const body = (await res.json()) as { notification: Record<string, unknown> };
    expect(body.notification.status).toBe("failed");
    expect(body.notification.lastError).toBeTruthy();
    expect(body.notification.attempts).toBe(1);
    expect(store.findByEventId("order.confirmed:NC-TEST-1")?.status).toBe("failed");
  });
});

describe("routing", () => {
  it("returns 404 for unknown paths", async () => {
    const base = await startServer(deps());
    const res = await fetch(`${base}/nope`);
    expect(res.status).toBe(404);
  });

  it("returns 405 for non-POST methods on /v1/notifications", async () => {
    const base = await startServer(deps());
    const res = await fetch(`${base}/v1/notifications`, { method: "PUT" });
    expect(res.status).toBe(405);
  });
});