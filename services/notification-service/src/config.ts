export interface ServiceConfig {
  port: number;
  token: string;
  dbPath: string;
}

/**
 * Reads the service configuration from the environment. The token is
 * required: the service deliberately refuses to start unauthenticated, since
 * every write endpoint is protected by a shared bearer secret.
 */
export function readServiceConfig(env: NodeJS.ProcessEnv): ServiceConfig {
  const rawPort = env.PORT ?? "4001";
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: ${rawPort}`);
  }

  const token = env.NOTIFICATION_SERVICE_TOKEN ?? "";
  if (!token) {
    throw new Error(
      "NOTIFICATION_SERVICE_TOKEN is required (shared secret with the sender)."
    );
  }

  const dbPath = env.DB_PATH ?? "data/notifications.db";
  return { port, token, dbPath };
}