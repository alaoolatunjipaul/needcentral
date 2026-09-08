import { afterEach, describe, expect, it, vi } from "vitest";
import { createServer as createNetServer } from "node:net";
import type { AddressInfo } from "node:net";
import {
  sendNotificationEvent,
  type NotificationEvent,
} from "./notifications-client";

function validEvent(overrides: Partial<NotificationEvent> = {}): NotificationEvent {
  return {
    eventId: "order.confirmed:NC-TEST-1",
    type: "order.confirmed",
    userId: "user_1",
    channels: ["email"],
    payload: { orderId: "NC-TEST-1", totalCents: 1000 },
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("sendNotificationEvent", () => {
  it("short-circuits when the service is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendNotificationEvent(validEvent());
    expect(result).toEqual({ ok: false, error: "not-configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid event without calling the network", async () => {
    vi.stubEnv("NOTIFICATION_SERVICE_URL", "http://localhost:4001");
    vi.stubEnv("NOTIFICATION_SERVICE_TOKEN", "token");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendNotificationEvent(
      validEvent({ type: "unknown.event" as "order.confirmed", userId: "" })
    );
    expect(result).toEqual({ ok: false, error: "invalid" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the event contract and succeeds on a 201", async () => {
    vi.stubEnv("NOTIFICATION_SERVICE_URL", "http://localhost:4001/");
    vi.stubEnv("NOTIFICATION_SERVICE_TOKEN", "shared-secret");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ ok: true, duplicate: false, notification: {} }),
        { status: 201 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendNotificationEvent(validEvent());
    expect(result).toEqual({ ok: true, duplicate: false });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:4001/v1/notifications");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer shared-secret");
    expect(headers["Content-Type"]).toBe("application/json");

    const sentBody = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(sentBody.eventId).toBe("order.confirmed:NC-TEST-1");
    expect(sentBody.type).toBe("order.confirmed");
    expect(sentBody.userId).toBe("user_1");
    expect(sentBody.channels).toEqual(["email"]);
    expect(sentBody.payload).toEqual({ orderId: "NC-TEST-1", totalCents: 1000 });
  });

  it("reports a duplicate event as a successful no-op", async () => {
    vi.stubEnv("NOTIFICATION_SERVICE_URL", "http://localhost:4001");
    vi.stubEnv("NOTIFICATION_SERVICE_TOKEN", "shared-secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true, duplicate: true }), { status: 200 })
      )
    );

    const result = await sendNotificationEvent(validEvent());
    expect(result).toEqual({ ok: true, duplicate: true });
  });

  it("reports a non-2xx response as rejected with the status", async () => {
    vi.stubEnv("NOTIFICATION_SERVICE_URL", "http://localhost:4001");
    vi.stubEnv("NOTIFICATION_SERVICE_TOKEN", "shared-secret");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("err", { status: 500 })));

    const result = await sendNotificationEvent(validEvent());
    expect(result).toEqual({ ok: false, error: "rejected", status: 500 });
  });

  it("never throws when the network is unavailable", async () => {
    vi.stubEnv("NOTIFICATION_SERVICE_URL", "http://localhost:4001");
    vi.stubEnv("NOTIFICATION_SERVICE_TOKEN", "shared-secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed"))
    );

    const result = await sendNotificationEvent(validEvent());
    expect(result).toEqual({ ok: false, error: "unreachable" });
  });

  it("degrades gracefully against a genuinely stopped service (connection refused)", async () => {
    const port = await acquireClosedPort();
    vi.stubEnv("NOTIFICATION_SERVICE_URL", `http://127.0.0.1:${port}`);
    vi.stubEnv("NOTIFICATION_SERVICE_TOKEN", "shared-secret");

    const result = await sendNotificationEvent(validEvent());
    expect(result).toEqual({ ok: false, error: "unreachable" });
    expect(result.ok).toBe(false);
  });
});

async function acquireClosedPort(): Promise<number> {
  const server = createNetServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const port = (server.address() as AddressInfo).port;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return port;
}