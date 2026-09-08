import { timingSafeEqual } from "node:crypto";

/**
 * Verifies an `Authorization: Bearer <token>` header against the expected
 * shared secret using a timing-safe comparison. The header must contain
 * exactly one token.
 */
export function verifyBearerToken(
  authorization: string | null | undefined,
  expected: string
): boolean {
  if (!authorization) return false;
  const parts = authorization.split(" ");
  if (parts.length !== 2) return false;
  const [scheme, token] = parts;
  if (scheme !== "Bearer" || !token) return false;
  if (token.length !== expected.length) return false;

  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}