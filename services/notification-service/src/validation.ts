// Notification event contract (Roadmap #8).
//
// The monolith may only send event types listed here. Keeping an allowlist
// makes the service-to-service contract explicit and rejects accidental or
// unknown events at the boundary.

export const KNOWN_EVENT_TYPES = ["order.confirmed"] as const;
export const KNOWN_CHANNELS = ["email", "sms", "push"] as const;

export const MAX_PAYLOAD_BYTES = 16_384;

export interface NotificationInput {
  eventId: string;
  type: (typeof KNOWN_EVENT_TYPES)[number];
  userId: string;
  channels: string[];
  payload?: Record<string, unknown>;
}

export type ValidationResult =
  | { ok: true; input: NotificationInput }
  | { ok: false; code: string; error: string };

export function validateNotificationInput(value: unknown): ValidationResult {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {
      ok: false,
      code: "invalid",
      error: "Request body must be a JSON object.",
    };
  }
  const record = value as Record<string, unknown>;

  const eventId = typeof record.eventId === "string" ? record.eventId.trim() : "";
  if (!eventId) {
    return { ok: false, code: "invalid", error: "eventId is required." };
  }
  if (eventId.length > 200 || !/^[A-Za-z0-9._:-]+$/.test(eventId)) {
    return {
      ok: false,
      code: "invalid",
      error: "eventId must be 1–200 characters in [A-Za-z0-9._:-].",
    };
  }

  const type = typeof record.type === "string" ? record.type : "";
  if (!(KNOWN_EVENT_TYPES as readonly string[]).includes(type)) {
    return {
      ok: false,
      code: "invalid",
      error: `type must be one of: ${KNOWN_EVENT_TYPES.join(", ")}.`,
    };
  }

  const userId = typeof record.userId === "string" ? record.userId.trim() : "";
  if (!userId) {
    return { ok: false, code: "invalid", error: "userId is required." };
  }
  if (userId.length > 128) {
    return { ok: false, code: "invalid", error: "userId is too long." };
  }

  let channels: string[];
  if (record.channels === undefined) {
    channels = ["email"];
  } else if (Array.isArray(record.channels)) {
    if (record.channels.length === 0) {
      channels = ["email"];
    } else {
      const candidates = record.channels.map((c) =>
        typeof c === "string" ? c : ""
      );
      if (
        candidates.length > 5 ||
        candidates.some((c) => !(KNOWN_CHANNELS as readonly string[]).includes(c))
      ) {
        return {
          ok: false,
          code: "invalid",
          error: `channels must be from: ${KNOWN_CHANNELS.join(", ")}.`,
        };
      }
      channels = candidates;
    }
  } else {
    return {
      ok: false,
      code: "invalid",
      error: "channels must be an array of channel names.",
    };
  }

  let payload: Record<string, unknown> | undefined;
  if (record.payload !== undefined) {
    if (
      typeof record.payload !== "object" ||
      record.payload === null ||
      Array.isArray(record.payload)
    ) {
      return { ok: false, code: "invalid", error: "payload must be a JSON object." };
    }
    const raw = JSON.stringify(record.payload);
    if (raw.length > MAX_PAYLOAD_BYTES) {
      return { ok: false, code: "invalid", error: "payload is too large." };
    }
    payload = record.payload as Record<string, unknown>;
  }

  return {
    ok: true,
    input: {
      eventId,
      type: type as NotificationInput["type"],
      userId,
      channels: [...new Set(channels)],
      ...(payload !== undefined ? { payload } : {}),
    },
  };
}