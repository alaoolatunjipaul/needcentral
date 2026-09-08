import { describe, expect, it } from "vitest";
import { readServiceConfig } from "./config.js";

describe("readServiceConfig", () => {
  it("returns configured values", () => {
    const config = readServiceConfig({
      NOTIFICATION_SERVICE_TOKEN: "secret",
      PORT: "4123",
      DB_PATH: "data/test.db",
    });
    expect(config.port).toBe(4123);
    expect(config.token).toBe("secret");
    expect(config.dbPath).toBe("data/test.db");
  });

  it("applies default port and db path", () => {
    const config = readServiceConfig({ NOTIFICATION_SERVICE_TOKEN: "secret" });
    expect(config.port).toBe(4001);
    expect(config.dbPath).toBe("data/notifications.db");
  });

  it("throws when the token is missing", () => {
    expect(() => readServiceConfig({})).toThrow(/NOTIFICATION_SERVICE_TOKEN/);
  });

  it("throws on invalid port", () => {
    for (const port of ["abc", "0", "99999", "-1"]) {
      expect(() =>
        readServiceConfig({ NOTIFICATION_SERVICE_TOKEN: "secret", PORT: port })
      ).toThrow(/PORT/);
    }
  });
});