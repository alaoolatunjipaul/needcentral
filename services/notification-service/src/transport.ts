import type { StoredNotification } from "./store.js";

// Delivery abstraction for the notification service (Roadmap #8).
//
// The MVP ships a "dev transport" that logs the notification and resolves
// successfully — it never touches SMS / email / push providers (explicitly
// out of scope). The interface is the seam where a real provider adapter
// would be added later without changing the API or persistence logic.

export interface NotificationTransport {
  deliver(notification: StoredNotification): Promise<void>;
}

export interface DevTransportOptions {
  log?: (message: string) => void;
}

export function createDevTransport(
  options: DevTransportOptions = {}
): NotificationTransport {
  const log = options.log ?? ((message: string) => console.log(message));
  return {
    async deliver(notification: StoredNotification): Promise<void> {
      await new Promise((resolve) => setTimeout(resolve, 0));
      log(
        `[notification-service] deliver eventId=${notification.eventId} type=${notification.type} userId=${notification.userId} channels=${notification.channels.join(",")}`
      );
    },
  };
}