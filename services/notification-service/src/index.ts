import { readServiceConfig } from "./config.js";
import { createStore } from "./store.js";
import { createAppServer } from "./server.js";
import { createDevTransport } from "./transport.js";

const config = readServiceConfig(process.env);

const log = (message: string): void => console.log(message);
const store = createStore(config.dbPath);
const app = createAppServer({
  config: { token: config.token },
  store,
  transport: createDevTransport({ log }),
  log,
});

app.listen(config.port, () => {
  log(`[notification-service] listening on http://localhost:${config.port}`);
  log(`[notification-service] db=${config.dbPath}`);
});

function shutdown(): void {
  app.close(() => {
    store.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);