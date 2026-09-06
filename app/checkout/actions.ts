"use server";

import { getServerSession } from "@/lib/auth-service";
import { createOrder } from "@/lib/orders-data";
import { assembleOrder } from "@/lib/order-assembly";
import { initializePayment } from "@/lib/paystack";
import type { Address, DeliveryOptionId } from "@/types";

export type StartCheckoutPaymentInput = {
  email: string;
  items: Array<{ productId: string; quantity: number }>;
  deliveryOptionId: DeliveryOptionId;
  shippingAddress?: Address;
  pickupStationId?: string;
  couponCode?: string;
};

export type StartCheckoutPaymentResult =
  | {
      ok: true;
      orderId: string;
      reference: string;
      amountCents: number;
      authorizationUrl: string;
      accessCode: string;
    }
  | { ok: false; code: "auth" | "invalid" | "provider" | "retry"; error: string };

/**
 * Begins the Paystack checkout for an authenticated customer:
 *   1. validates the checkout payload,
 *   2. recomputes the order server-side from the product catalog / delivery /
 *      coupon rules (never trusts a client-supplied total),
 *   3. persists the order as `pending` (payment not yet verified),
 *   4. initializes a Paystack transaction with the server-computed amount,
 *   5. returns the Paystack authorization URL for the client to redirect to.
 *
 * The amount charged is always the server-recomputed total; a redirect into
 * Paystack alone never confirms the order (see the callback / webhook).
 */
export async function startCheckoutPayment(
  input: StartCheckoutPaymentInput
): Promise<StartCheckoutPaymentResult> {
  try {
    const session = await getServerSession();
    if (!session) {
      return {
        ok: false,
        code: "auth",
        error: "Please sign in to complete your order and pay.",
      };
    }

    const assembled = await assembleOrder(input);
    if (!assembled.ok) {
      return { ok: false, code: "invalid", error: assembled.error };
    }

    const order = assembled.order;
    const callbackUrl = `${appUrl()}/orders?paid=return&ref=${encodeURIComponent(
      order.id
    )}`;

    const initialized = await initializePayment({
      reference: order.id,
      amountCents: order.totalCents,
      email: order.email,
      currency: "NGN",
      callbackUrl,
    });

    if (!initialized.ok) {
      console.error("Paystack initialize failed:", initialized.code);
      return {
        ok: false,
        code: "provider",
        error:
          "We couldn't reach the payment provider right now. Please try again.",
      };
    }

    // Persist the order as pending only after the transaction initializes so we
    // do not keep abandoned checkout rows around when Paystack is unavailable.
    await createOrder(session.id, order);

    return {
      ok: true,
      orderId: order.id,
      reference: order.id,
      amountCents: order.totalCents,
      authorizationUrl: initialized.authorizationUrl,
      accessCode: initialized.accessCode,
    };
  } catch (err) {
    console.error("startCheckoutPayment failed:", err);
    return {
      ok: false,
      code: "retry",
      error:
        "Something went wrong starting your payment. Please try again in a moment.",
    };
  }
}

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000"
  );
}
