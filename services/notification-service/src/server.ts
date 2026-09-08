import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { verifyBearerToken } from "./auth.js";
import { validateNotificationInput } from "./validation.js";
import type { NotificationStore } from "./store.js";
import type { NotificationTransport } from "./transport.js";

// Notification service HTTP server (Roadmap #8). A dependency-injectable app
// so tests can start it on an ephemeral port with an in-memory store.
//
// API:
//   GET  /v1/health           200 { ok: true, service, timestamp }   (no auth)
//   POST /v1/notifications    201 created / 200 duplicate (same eventId),
//                             400 invalid, 401 unauthorized, 405, 500
//
// Idempotency: the eventId is the deduplication key. A duplicate eventId
// returns the existing notification with `duplicate: true` and performs no
// further delivery. Delivery is best-effort: acceptance (201/200) does not
// depend on the transport succeeding; the delivery outcome is recorded on
// the persisted row (status received/delivered/failed).

export interface AppDeps {
  config: { token: string };
  store: NotificationStore;
  transport: NotificationTransport;
  log?: (message: string) => void;
}

const MAX_BODY_BYTES = 1_048_576;

export function createAppServer(deps: AppDeps): Server {
  const log = deps.log ?? ((message: string) => console.log(message));

  async function handleCreate(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const authorization = req.headers.authorization ?? null;
    if (!verifyBearerToken(authorization, deps.config.token)) {
      sendJson(res, 401, { error: "unauthorized" });
      return;
    }

    const read = await readBody(req, MAX_BODY_BYTES);
    if (!read.ok) {
      sendJson(res, 400, { error: "request_body_too_large" });
      return;
    }
    const raw = read.body;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      sendJson(res, 400, { error: "invalid_json" });
      return;
    }

    const validation = validateNotificationInput(parsed);
    if (!validation.ok) {
      sendJson(res, 400, { error: validation.error, code: validation.code });
      return;
    }
    const input = validation.input;

    const existing = deps.store.findByEventId(input.eventId);
    if (existing) {
      sendJson(res, 200, {
        ok: true,
        duplicate: true,
        notification: existing,
      });
      return;
    }

    const created = deps.store.create({
      eventId: input.eventId,
      type: input.type,
      userId: input.userId,
      channels: input.channels,
      payload: input.payload,
    });

    try {
      await deps.transport.deliver(created);
      const delivered = deps.store.recordDelivery(created.id, null) ?? created;
      sendJson(res, 201, {
        ok: true,
        duplicate: false,
        notification: delivered,
      });
    } catch (err) {
      const failed = deps.store.recordDelivery(created.id, String(err)) ?? created;
      log(
        `[notification-service] delivery failed eventId=${created.eventId}: ${String(err)}`
      );
      sendJson(res, 201, {
        ok: true,
        duplicate: false,
        notification: failed,
      });
    }
  }

  function handleRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): void {
    const url = new URL(req.url ?? "/", "http://localhost");

    if (url.pathname === "/v1/health" && req.method === "GET") {
      sendJson(res, 200, {
        ok: true,
        service: "notification-service",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (url.pathname === "/v1/notifications") {
      if (req.method === "POST") {
        void handleCreate(req, res).catch((err) => {
          log(`[notification-service] internal error: ${String(err)}`);
          if (!res.headersSent) {
            sendJson(res, 500, { error: "internal_error" });
          }
        });
        return;
      }
      sendJson(res, 405, { error: "method_not_allowed" });
      return;
    }

    sendJson(res, 404, { error: "not_found" });
  }

  return createServer(handleRequest);
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>
): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

type ReadBodyResult = { ok: true; body: string } | { ok: false; code: "too_large" };

function readBody(req: IncomingMessage, limitBytes: number): Promise<ReadBodyResult> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let tooLarge = false;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limitBytes) {
        // Keep draining the stream (so the caller can still send a proper
        // response) but stop buffering the oversized body.
        tooLarge = true;
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) resolve({ ok: false, code: "too_large" });
      else resolve({ ok: true, body: Buffer.concat(chunks).toString("utf8") });
    });
    req.on("error", reject);
  });
}