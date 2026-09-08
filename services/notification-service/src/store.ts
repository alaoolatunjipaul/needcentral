import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Notification persistence (Roadmap #8). The service owns this data — the
// NeedCentral monolith never reads or writes it. Uses Node's built-in SQLite
// (node:sqlite, available and un-flagged since Node 22.13) so there are no
// native dependencies and no migration tooling: the single table is created
// with CREATE TABLE IF NOT EXISTS on startup.
//
// Lifecycle: a notification is inserted as "received", then delivery is
// attempted (best-effort). A successful attempt flips status to "delivered"
// with a delivered_at stamp; a failing attempt flips status to "failed" and
// records the error while incrementing attempts. Acceptance (201) never
// depends on delivery succeeding — delivery is observable on the row.

export type NotificationStatus = "received" | "delivered" | "failed";

export interface StoredNotification {
  id: string;
  eventId: string;
  type: string;
  userId: string;
  channels: string[];
  payload: Record<string, unknown>;
  status: NotificationStatus;
  attempts: number;
  lastError: string | null;
  requestedAtISO: string;
  deliveredAtISO: string | null;
}

export interface CreateNotificationInput {
  eventId: string;
  type: string;
  userId: string;
  channels: string[];
  payload?: Record<string, unknown>;
}

export interface NotificationStore {
  close(): void;
  findByEventId(eventId: string): StoredNotification | undefined;
  create(input: CreateNotificationInput): StoredNotification;
  recordDelivery(id: string, error: string | null): StoredNotification | undefined;
  countAll(): number;
}

type Row = Record<string, unknown>;

export function createStore(dbPath: string): NotificationStore {
  if (dbPath !== ":memory:") {
    mkdirSync(dirname(dbPath), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id           TEXT PRIMARY KEY,
      event_id     TEXT NOT NULL UNIQUE,
      type         TEXT NOT NULL,
      user_id      TEXT NOT NULL,
      channels     TEXT NOT NULL,
      payload      TEXT NOT NULL DEFAULT '{}',
      status       TEXT NOT NULL,
      attempts     INTEGER NOT NULL DEFAULT 0,
      last_error   TEXT,
      requested_at TEXT NOT NULL,
      delivered_at TEXT
    );
  `);

  const insert = db.prepare(`
    INSERT INTO notifications
      (id, event_id, type, user_id, channels, payload, status, attempts, last_error, requested_at, delivered_at)
    VALUES
      (?, ?, ?, ?, ?, ?, 'received', 0, NULL, ?, NULL)
  `);
  const selectByEvent = db.prepare(
    "SELECT * FROM notifications WHERE event_id = ?"
  );
  const selectById = db.prepare("SELECT * FROM notifications WHERE id = ?");
  const updateDelivery = db.prepare(`
    UPDATE notifications
      SET status = ?, attempts = attempts + 1, last_error = ?, delivered_at = ?
    WHERE id = ?
  `);
  const countStmt = db.prepare("SELECT COUNT(*) AS n FROM notifications");

  const rowToNotification = (row: Row): StoredNotification => ({
    id: String(row.id),
    eventId: String(row.event_id),
    type: String(row.type),
    userId: String(row.user_id),
    channels: JSON.parse(String(row.channels)) as string[],
    payload: JSON.parse(String(row.payload)) as Record<string, unknown>,
    status: String(row.status) as NotificationStatus,
    attempts: Number(row.attempts),
    lastError: row.last_error === null ? null : String(row.last_error),
    requestedAtISO: String(row.requested_at),
    deliveredAtISO: row.delivered_at === null ? null : String(row.delivered_at),
  });

  return {
    close() {
      db.close();
    },

    findByEventId(eventId: string): StoredNotification | undefined {
      const row = selectByEvent.get(eventId) as Row | undefined;
      return row ? rowToNotification(row) : undefined;
    },

    create(input: CreateNotificationInput): StoredNotification {
      const requestedAtISO = new Date().toISOString();
      const id = randomUUID();
      let row: Row | undefined;
      try {
        insert.run(
          id,
          input.eventId,
          input.type,
          input.userId,
          JSON.stringify(input.channels),
          JSON.stringify(input.payload ?? {}),
          requestedAtISO
        );
        row = selectById.get(id) as Row | undefined;
      } catch {
        // Unique (event_id) violation — an event that arrived between the
        // HTTP-layer check and this insert. Serve the existing row instead.
        row = selectByEvent.get(input.eventId) as Row | undefined;
      }
      if (!row) {
        throw new Error(`Failed to persist notification ${input.eventId}`);
      }
      return rowToNotification(row);
    },

    recordDelivery(id: string, error: string | null): StoredNotification | undefined {
      const now = new Date().toISOString();
      if (error === null) {
        updateDelivery.run("delivered", null, now, id);
      } else {
        updateDelivery.run("failed", String(error), null, id);
      }
      const row = selectById.get(id) as Row | undefined;
      return row ? rowToNotification(row) : undefined;
    },

    countAll(): number {
      return Number((countStmt.get() as Row).n);
    },
  };
}