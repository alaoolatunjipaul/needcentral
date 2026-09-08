// Roadmap #8 — NeedCentral → Notification service client.
//
// Best-effort, outbound notification emission. This module is imported ONLY
// from server-side code (it is bundled to the browser) and it must NEVER
// throw: notifications are an optional side effect, and checkout / order
// confirmation must succeed even when the notification service is down,
// misconfigured, slow, or absent.
//
// Configuration (env, all optional):
//   NOTIFICATION_SERVICE_URL   base URL of the service, e.g. http://localhost:4001
//   NOTIFICATION_SERVICE_TOKEN shared bearer secret (must match the service)
//
// When either variable is missing the client short-circuits to `ok: false,
// error: "not-configured"` and no network call is made.

export const NOTIFICATION_CHANNELS = ["email", "sms", "push"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_EVENT_TYPES = ["order.confirmed"] as const;
export type NotificationEventType = (typeof NOTIFICATION_EVENT_TYPES)[number];

export interface NotificationEvent {
  eventId: string;
  type: NotificationEventType;
  userId: string;
  channels?: NotificationChannel[];
  payload?: Record<string, unknown>;
}

export type NotificationSendResult =
  | { ok: true; duplicate: boolean }
  | {
      ok: false;
      error: "not-configured" | "unreachable" | "rejected" | "invalid";
      status?: number;
    };

const REQUEST_TIMEOUT_MS = 2500;
const MAX_PAYLOAD_LENGTH = 16_384;

export function notificationServiceEndpoint(): {
  url: string | undefined;
  token: string | undefined;
} {
  return {
    url: process.env.NOTIFICATION_SERVICE_URL,
    token: process.env.NOTIFICATION_SERVICE_TOKEN,
  };
}

export function validateNotificationEvent(event: NotificationEvent): boolean {
  if (!event || typeof event !== "object") return false;
  const { eventId, type, userId, channels, payload } = event;

  if (typeof eventId !== "string" || !eventId || eventId.length > 200) {
    return false;
  }
  if (!(NOTIFICATION_EVENT_TYPES as readonly string[]).includes(type)) {
    return false;
  }
  if (typeof userId !== "string" || !userId || userId.length > 128) {
    return false;
  }
  if (channels !== undefined) {
    if (!Array.isArray(channels) || channels.length > 5) return false;
    if (channels.some((c) => !(NOTIFICATION_CHANNELS as readonly string[]).includes(c))) {
      return false;
    }
  }
  if (payload !== undefined) {
    if (
      typeof payload !== "object" ||
      payload === null ||
      Array.isArray(payload) ||
      JSON.stringify(payload).length > MAX_PAYLOAD_LENGTH
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Sends a notification event to the service. Resolves to a result and never
 * rejects. Safe to fire-and-forget (`void sendNotificationEvent(...)`).
 */
export async function sendNotificationEvent(
  event: NotificationEvent
): Promise<NotificationSendResult> {
  if (!validateNotificationEvent(event)) {
    return { ok: false, error: "invalid" };
  }

  const { url, token } = notificationServiceEndpoint();
  if (!url || !token) {
    return { ok: false, error: "not-configured" };
  }

  let response: Response;
  try {
    response = await fetch(`${replaceTrailingSlash(url)}/v1/notifications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId: event.eventId,
        type: event.type,
        userId: event.userId,
        channels: event.channels ?? ["email"],
        ...(event.payload !== undefined ? { payload: event.payload } : {}),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    // Service unreachable / timeout / network error — treat as contacted.
    return { ok: false, error: "unreachable" };
  }

  if (response.ok) {
    let duplicate = false;
    try {
      const body = (await response.json()) as { duplicate?: unknown };
      duplicate = body.duplicate === true;
    } catch {
      // A 2xx with an unreadable body is still an accepted notification.
    }
    return { ok: true, duplicate };
  }

  return { ok: false, error: "rejected", status: response.status };
}

function replaceTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}