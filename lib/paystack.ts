import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

// Server-only Paystack client (Payment Gateway Integration stage). This module
// is imported only from Server Components / Server Actions / Route Handlers so
// that the gateway secret key never reaches the browser. Uses the hosted
// Standard checkout flow:
//   1. initialize -> authorization_url (redirect the customer to Paystack)
//   2. Paystack redirects the customer back to callback_url
//   3. verify   -> authoritative server-side confirmation of the transaction
//   4. webhook  -> charge.success event, HMAC-SHA512 signed, confirms in the
//                  background if the user never returned from Paystack.
//
// TEST mode only: PAYSTACK_SECRET_KEY must be a Paystack *test* secret key.
// No card data, CVV, PIN or real credentials are handled or stored anywhere.

const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  return key;
}

export type InitializeParams = {
  reference: string; // must be <=128 chars, charset [-.=] and alphanumeric
  amountCents: number; // subunit (kobo) for NGN
  email: string;
  currency?: string;
  callbackUrl: string;
};

export type InitializeResult = {
  ok: true;
  authorizationUrl: string;
  accessCode: string;
  reference: string;
} | {
  ok: false;
  code: string;
  message: string;
};

/**
 * POST /transaction/initialize. Returns the Paystack-hosted authorization URL
 * to redirect the customer to. The reference is the order id and is fully
 * server-generated (never client-controlled).
 */
export async function initializePayment(
  params: InitializeParams
): Promise<InitializeResult> {
  const body = {
    reference: params.reference,
    amount: params.amountCents,
    email: params.email,
    currency: params.currency ?? "NGN",
    callback_url: params.callbackUrl,
    channels: ["card", "bank", "ussd", "qr", "transfer", "bank_transfer"],
  };

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let json: Record<string, unknown>;
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    return {
      ok: false,
      code: `HTTP_${res.status}`,
      message: "Paystack returned a non-JSON response",
    };
  }

  const data = (json.data ?? {}) as Record<string, unknown>;
  if (res.ok && json.status === true && data.authorization_url) {
    return {
      ok: true,
      authorizationUrl: String(data.authorization_url),
      accessCode: String(data.access_code ?? ""),
      reference: String(data.reference ?? params.reference),
    };
  }

  return {
    ok: false,
    code: String((data as { code?: unknown }).code ?? `HTTP_${res.status}`),
    message:
      String((data as { message?: unknown }).message ?? json.message ?? "Failed"),
  };
}

export type VerifiedPayment = {
  reference: string;
  status: string; // "success" on paid
  amountCents: number;
  currency: string;
  paidAtISO: string | null;
};

/**
 * GET /transaction/verify/:reference. Authoritative server-side confirmation
 * of a transaction. Returns null when the reference is not found/error.
 */
export async function verifyPayment(
  reference: string
): Promise<VerifiedPayment | null> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    }
  );

  let json: Record<string, unknown>;
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }

  if (res.ok !== true || json.status !== true) {
    return null;
  }

  const data = (json.data ?? {}) as Record<string, unknown>;
  return {
    reference: String(data.reference ?? reference),
    status: String(data.status ?? ""),
    amountCents: Number(data.amount ?? 0),
    currency: String(data.currency ?? "NGN"),
    paidAtISO:
      typeof data.paid_at === "string" && data.paid_at
        ? new Date(data.paid_at).toISOString()
        : null,
  };
}

/**
 * Verifies the Paystack webhook HMAC-SHA512 signature. Paystack signs
 * JSON.stringify(body) with the secret key; as long as we HMAC the exact raw
 * request body bytes, a byte-for-byte match is guaranteed.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secretKey())
    .update(rawBody)
    .digest("hex");

  let a: Buffer;
  let b: Buffer;
  try {
    a = Buffer.from(expected, "hex");
    b = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}
