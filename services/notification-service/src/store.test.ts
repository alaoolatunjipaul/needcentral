import { describe, expect, it } from "vitest";
import { createStore } from "./store.js";

describe("createStore", () => {
  it("creates a notification and finds it by eventId", () => {
    const store = createStore(":memory:");
    const created = store.create({
      eventId: "order.confirmed:NC-TEST-1",
      type: "order.confirmed",
      userId: "user_1",
      channels: ["email"],
      payload: { orderId: "NC-TEST-1" },
    });
    expect(created.status).toBe("received");
    expect(created.attempts).toBe(0);
    expect(created.lastError).toBeNull();
    expect(created.deliveredAtISO).toBeNull();
    expect(created.channels).toEqual(["email"]);
    expect(created.payload).toEqual({ orderId: "NC-TEST-1" });

    const found = store.findByEventId("order.confirmed:NC-TEST-1");
    expect(found?.id).toBe(created.id);
    expect(store.findByEventId("order.confirmed:UNKNOWN")).toBeUndefined();
    expect(store.countAll()).toBe(1);
    store.close();
  });

  it("deduplicates by eventId at the store level", () => {
    const store = createStore(":memory:");
    const first = store.create({
      eventId: "order.confirmed:NC-TEST-1",
      type: "order.confirmed",
      userId: "user_1",
      channels: ["email"],
    });
    const second = store.create({
      eventId: "order.confirmed:NC-TEST-1",
      type: "order.confirmed",
      userId: "user_2",
      channels: ["email"],
    });
    expect(second.id).toBe(first.id);
    expect(second.userId).toBe("user_1");
    expect(store.countAll()).toBe(1);
    store.close();
  });

  it("records a successful delivery", () => {
    const store = createStore(":memory:");
    const created = store.create({
      eventId: "order.confirmed:NC-TEST-1",
      type: "order.confirmed",
      userId: "user_1",
      channels: ["email"],
    });
    const updated = store.recordDelivery(created.id, null);
    expect(updated?.status).toBe("delivered");
    expect(updated?.attempts).toBe(1);
    expect(updated?.lastError).toBeNull();
    expect(updated?.deliveredAtISO).toBeTruthy();
    store.close();
  });

  it("records a failed delivery", () => {
    const store = createStore(":memory:");
    const created = store.create({
      eventId: "order.confirmed:NC-TEST-1",
      type: "order.confirmed",
      userId: "user_1",
      channels: ["email"],
    });
    const updated = store.recordDelivery(created.id, "provider down");
    expect(updated?.status).toBe("failed");
    expect(updated?.attempts).toBe(1);
    expect(updated?.lastError).toBe("provider down");
    expect(updated?.deliveredAtISO).toBeNull();
    store.close();
  });
});