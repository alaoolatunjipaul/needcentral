import { describe, expect, it } from "vitest";
import { validateNotificationInput } from "./validation.js";

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    eventId: "order.confirmed:NC-TEST-1",
    type: "order.confirmed",
    userId: "user_1",
    ...overrides,
  };
}

describe("validateNotificationInput", () => {
  it("accepts a minimal valid event and defaults channels to email", () => {
    const result = validateNotificationInput(validBody());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.input.channels).toEqual(["email"]);
      expect(result.input.payload).toBeUndefined();
    }
  });

  it("accepts payload and deduplicates channels", () => {
    const result = validateNotificationInput(
      validBody({
        channels: ["email", "email", "sms"],
        payload: { orderId: "NC-TEST-1", totalCents: 500 },
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.input.channels).toEqual(["email", "sms"]);
    }
  });

  it("rejects a non-object body", () => {
    for (const value of ["text", 42, null, ["array"], undefined]) {
      const result = validateNotificationInput(value);
      expect(result.ok).toBe(false);
    }
  });

  it("rejects a missing or malformed eventId", () => {
    expect(validateNotificationInput(validBody({ eventId: "" })).ok).toBe(false);
    expect(validateNotificationInput(validBody({ eventId: "   " })).ok).toBe(false);
    expect(validateNotificationInput(validBody({ eventId: "has space" })).ok).toBe(false);
    expect(validateNotificationInput(validBody({ eventId: "emoji🎉" })).ok).toBe(false);
    expect(validateNotificationInput(validBody({ eventId: "x".repeat(201) })).ok).toBe(false);
  });

  it("rejects an unknown event type", () => {
    expect(validateNotificationInput(validBody({ type: "unknown.event" })).ok).toBe(false);
    expect(validateNotificationInput(validBody({ type: "" })).ok).toBe(false);
  });

  it("rejects a missing or empty userId", () => {
    expect(validateNotificationInput(validBody({ userId: "" })).ok).toBe(false);
    expect(validateNotificationInput(validBody({ userId: "   " })).ok).toBe(false);
  });

  it("rejects bad channels", () => {
    expect(
      validateNotificationInput(validBody({ channels: "email" })).ok
    ).toBe(false);
    expect(
      validateNotificationInput(validBody({ channels: ["telegram"] })).ok
    ).toBe(false);
    expect(
      validateNotificationInput(validBody({ channels: ["email", "email", "email", "email", "email", "email"] })).ok
    ).toBe(false);
  });

  it("defaults empty channels to email", () => {
    const result = validateNotificationInput(validBody({ channels: [] }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.input.channels).toEqual(["email"]);
  });

  it("rejects a non-object or oversized payload", () => {
    expect(validateNotificationInput(validBody({ payload: "hello" })).ok).toBe(false);
    expect(validateNotificationInput(validBody({ payload: ["a"] })).ok).toBe(false);
    expect(validateNotificationInput(validBody({ payload: null })).ok).toBe(false);
    expect(
      validateNotificationInput(validBody({ payload: { data: "x".repeat(20_000) } })).ok
    ).toBe(false);
  });
});