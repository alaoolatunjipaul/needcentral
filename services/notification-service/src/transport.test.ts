import { describe, expect, it, vi } from "vitest";
import { createDevTransport } from "./transport.js";
import type { StoredNotification } from "./store.js";

function notification(overrides: Partial<StoredNotification> = {}) {
  return {
    id: "n1",
    eventId: "order.confirmed:NC-TEST-1",
    type: "order.confirmed",
    userId: "user_1",
    channels: ["email"],
    payload: {},
    status: "received",
    attempts: 0,
    lastError: null,
    requestedAtISO: new Date().toISOString(),
    deliveredAtISO: null,
    ...overrides,
  } as StoredNotification;
}

describe("createDevTransport", () => {
  it("logs the notification and resolves", async () => {
    const log = vi.fn();
    const transport = createDevTransport({ log });
    await transport.deliver(notification());
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0]?.[0]).toContain("order.confirmed:NC-TEST-1");
    expect(log.mock.calls[0]?.[0]).toContain("user_1");
  });

  it("logs to console by default", async () => {
    const transport = createDevTransport();
    await expect(transport.deliver(notification())).resolves.toBeUndefined();
  });
});