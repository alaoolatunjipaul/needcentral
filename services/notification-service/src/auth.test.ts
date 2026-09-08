import { describe, expect, it } from "vitest";
import { verifyBearerToken } from "./auth.js";

describe("verifyBearerToken", () => {
  it("accepts a matching bearer token", () => {
    expect(verifyBearerToken("Bearer my-token", "my-token")).toBe(true);
  });

  it("rejects a wrong token", () => {
    expect(verifyBearerToken("Bearer my-token", "other-token")).toBe(false);
  });

  it("rejects a token of a different length", () => {
    expect(verifyBearerToken("Bearer short", "a-longer-token")).toBe(false);
  });

  it("rejects a missing header", () => {
    expect(verifyBearerToken(null, "my-token")).toBe(false);
    expect(verifyBearerToken(undefined, "my-token")).toBe(false);
  });

  it("rejects a malformed header", () => {
    expect(verifyBearerToken("Bearer", "my-token")).toBe(false);
    expect(verifyBearerToken("Bearer a b", "my-token")).toBe(false);
    expect(verifyBearerToken("Token my-token", "my-token")).toBe(false);
    expect(verifyBearerToken("bearer my-token", "my-token")).toBe(false);
  });
});