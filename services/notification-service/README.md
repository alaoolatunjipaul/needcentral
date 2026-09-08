# notification-service

NeedCentral Roadmap #8 — the **first independent microservice**. A single-purpose,
authenticated notification service with its own data store, developed to teach genuine
service-to-service communication without splitting the NeedCentral monolith.

NeedCentral remains a **modular monolith**. This service is additive: it accepts
`order.confirmed` events from the monolith, persists them, and (in the MVP) logs a
dev-transport delivery. No marketplace data, Paystack, auth, orders or sellers are
touched by this service.

## Why it is safe

- **Additive** — the monolith only gains an optional outbound call.
- **Own data** — it uses its own SQLite database; it never reads or writes the
  NeedCentral PostgreSQL schema.
- **Non-blocking** — the monolith fires-and-forgets; a down/unconfigured service
  never affects checkout or order confirmation.
- **Removable** — deleting this package and the monolith hook restores the previous
  tree exactly.

## Architecture

```
NeedCentral modular monolith (Next.js, port 3000)
   lib/notifications-client.ts  (fire-and-forget, never throws)
        │  POST /v1/notifications   { eventId, type, userId, channels, payload }
        ▼  Authorization: Bearer <shared secret>
notification-service (independent process, port 4001)
        └─ SQLite store (owned)  →  dev transport (logs the delivery)
```

## API contract

### `GET /v1/health` — no auth
`200 { ok: true, service: "notification-service", timestamp }`

### `POST /v1/notifications` — `Authorization: Bearer <token>`

**Request body**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `eventId` | string | yes | Deduplication key. 1–200 chars of `[A-Za-z0-9._:-]`. Monolith uses `order.confirmed:<orderId>`. |
| `type` | string | yes | Must be a registered event type. Currently: `order.confirmed`. |
| `userId` | string | yes | Internal user id this notification targets (max 128). |
| `channels` | string[] | no | From `["email", "sms", "push"]`. Defaults to `["email"]`. No providers are wired yet. |
| `payload` | object | no | Free-form JSON (max ~16 KB). |

**Responses**

| Status | Meaning |
| --- | --- |
| `201` | Created + accepted; `{ ok: true, duplicate: false, notification }`. The row's `status` reflects the async delivery outcome (`received`/`delivered`/`failed`). |
| `200` | **Idempotent duplicate** — an event with the same `eventId` already exists; no re-delivery. `{ ok: true, duplicate: true, notification }`. |
| `400` | Invalid body (`invalid`, `invalid_json`, `request_body_too_large`). |
| `401` | Missing / incorrect bearer token. |
| `405` | Non-POST to `/v1/notifications`. |
| `404` | Unknown path. |
| `500` | Internal error. |

## Idempotency / deduplication

`eventId` is the single deduplication key, enforced by both the HTTP layer and a
`UNIQUE` constraint in the store. A repeated delivery of the same `eventId` returns
`200` with the original record and performs **no further delivery** — so webhook /
callback retries cannot produce duplicate notifications.

## Failure handling

- **Sender side:** the monolith client (`lib/notifications-client.ts`) never throws.
  If the service is unreachable, times out (2.5s), rejects, or is unconfigured, it
  resolves `{ ok: false, ... }` and order confirmation proceeds untouched.
- **Service side:** delivery is best-effort. If the transport throws, the request is
  still accepted (`201`) and the row is marked `failed` with the error and an attempt
  count — acceptance never depends on the transport.

## Local development

Requirements: Node.js >= 22.13 (uses the built-in `node:sqlite`).

```bash
# 1. Service (own process, own package)
cd services/notification-service
npm install
copy .env.example .env      # set PORT / NOTIFICATION_SERVICE_TOKEN / DB_PATH
npm run dev                 # http://localhost:4001

# 2. Monolith (separate terminal)
#    set the SAME token in the monolith env:
#      NOTIFICATION_SERVICE_URL=http://localhost:4001
#      NOTIFICATION_SERVICE_TOKEN=dev-secret-change-me
npm run dev                 # http://localhost:3000
```

Place an order via the storefront; after Paystack (TEST) confirmation, the monolith
emits `order.confirmed` and the service logs the delivery.

**Verify graceful degradation:** stop the service, then repeat the checkout flow —
the order still confirms with no unhandled errors; only the notification side effect
is skipped.

## Tests

```bash
npm test          # vitest: unit (auth/validation/store/transport/config) + HTTP integration
npm run typecheck
npm run build     # tsc build to dist/
```

## Deployment (production-safe)

- Deploy as its own service/container on a different port/host from the monolith.
  There is no Kubernetes / mesh / discovery requirement in the MVP.
- Set `PORT`, `NOTIFICATION_SERVICE_TOKEN` (a long random secret, matched on the
  monolith side), and a persistent `DB_PATH`.
- The monolith keeps the marketplace database, Paystack, auth, orders and sellers
  unchanged. If the service is down, the marketplace remains fully functional.
- Note: the monolith currently fire-and-forgets events (`void`). For *guaranteed*
  delivery in serverless environments a durable outbox/queue is a documented future
  improvement — out of scope for this MVP.

## Removal

Delete `lib/notifications-client.ts` + its hook in `lib/payment-verify.ts` in the
monolith, and remove this directory. No shared schema, migration, or production data
is affected.