import "server-only";

import { getOrderById, markOrderPaid } from "@/lib/orders-data";
import { verifyPayment } from "@/lib/paystack";

// Server-side verification orchestration shared by the pay-return callback
// (/orders?paid=return&ref=...) and the Paystack webhook. Both paths route
// through here so confirmation only ever happens after the provider transaction
// has been verified server-side, its amount matches the order, and the update
// is applied idempotently.

export type PaymentVerificationOutcome =
  | "confirmed" // transaction verified + order marked paid
  | "already_paid" // order already confirmed/paid (idempotent no-op)
  | "not_found" // no order exists for that reference
  | "not_payable" // order exists but isn't awaiting payment
  | "failed" // provider transaction did not succeed
  | "amount_mismatch" // provider amount != order total
  | "verify_failed"; // provider verification call failed / unknown ref

/**
 * Verifies a Paystack transaction against the order that shares its reference
 * (the order id) and, only on success, marks the order paid. Idempotent: an
 * already-paid order yields "already_paid" with no further effect.
 */
export async function verifyAndConfirmPayment(
  reference: string
): Promise<PaymentVerificationOutcome> {
  if (!reference || typeof reference !== "string") {
    return "not_found";
  }

  const order = await getOrderById(reference);
  if (!order) {
    return "not_found";
  }

  // Idempotency: an order already carrying a verified payment is a no-op,
  // protecting against repeated callbacks / webhook deliveries.
  if (order.status === "confirmed" && order.paymentReference) {
    return "already_paid";
  }

  // Only orders awaiting payment may be confirmed through here.
  if (order.status !== "pending") {
    return "not_payable";
  }

  const verified = await verifyPayment(reference);
  if (!verified) {
    return "verify_failed";
  }

  if (verified.status !== "success") {
    return "failed";
  }

  // The amount charged must match the server-recorded order total exactly.
  if (verified.amountCents !== order.totalCents) {
    return "amount_mismatch";
  }

  await markOrderPaid(order.id, {
    provider: "paystack",
    reference: order.id,
    paidAtISO: verified.paidAtISO ?? new Date().toISOString(),
  });

  return "confirmed";
}
