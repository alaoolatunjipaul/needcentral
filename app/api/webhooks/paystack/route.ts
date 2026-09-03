import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { verifyAndConfirmPayment } from "@/lib/payment-verify";

// Paystack webhook handler (TEST mode only). We verify the HMAC-SHA512
// signature over the raw request body and, on charge.success, confirm the order
// server-side. The webhook covers the case where the customer never returns to
// the callback URL. We always respond 200 to the provider promptly; they will
// retry on non-2xx.

export async function POST(request: Request) {
  const signature = request.headers.get("x-paystack-signature");
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ ok: false, error: "read_failed" }, { status: 400 });
  }

  if (!rawBody) {
    return NextResponse.json({ ok: false, error: "empty_body" }, { status: 400 });
  }

  if (
    !verifyWebhookSignature(rawBody, signature) ||
    signature === null
  ) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  let payload: { event?: unknown; data?: { reference?: unknown } };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Always acknowledge receipt (200) so Paystack doesn't retry indefinitely on
  // event types we intentionally ignore.
  if (payload.event !== "charge.success") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const reference = payload.data?.reference;
  if (typeof reference !== "string" || !reference) {
    return NextResponse.json({ ok: true, error: "missing_reference" }, { status: 200 });
  }

  await verifyAndConfirmPayment(reference);

  return NextResponse.json({ ok: true }, { status: 200 });
}
