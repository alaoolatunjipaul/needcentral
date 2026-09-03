import { getServerSession } from "@/lib/auth-service";
import {
  getOrderOwnerId,
  listOrdersByUserId,
} from "@/lib/orders-data";
import { verifyAndConfirmPayment } from "@/lib/payment-verify";
import { OrdersView } from "./orders-view";

export const instant = false;

interface OrdersPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export type PaymentBannerResult =
  | { kind: "confirmed"; reference: string }
  | { kind: "already_paid"; reference: string }
  | { kind: "failed"; reference: string }
  | { kind: "amount_mismatch"; reference: string }
  | { kind: "abandoned"; reference: string }
  | { kind: "unknown"; reference: string }
  | null;

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await getServerSession();
  const params = await searchParams;

  // Server-side payment-callback verification. After Paystack redirects the
  // customer back here, we verify the transaction against the order owned by
  // the signed-in user before it is ever marked paid.
  let paymentResult: PaymentBannerResult = null;
  if (session) {
    const ref = firstParam(params, "ref");
    const fromGateway = firstParam(params, "paid") === "return";
    if (fromGateway && ref) {
      const ownerId = await getOrderOwnerId(ref);
      paymentResult =
        ownerId === session.id
          ? await resolveBanner(await verifyAndConfirmPayment(ref), ref)
          : { kind: "unknown", reference: ref };
    }
  }

  const dbOrders = session ? await listOrdersByUserId(session.id) : null;
  return <OrdersView dbOrders={dbOrders} paymentResult={paymentResult} />;
}

function firstParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string
): string {
  const value = searchParams?.[key];
  const single = Array.isArray(value) ? value[0] : value;
  return (single ?? "").trim();
}

function resolveBanner(
  outcome: ReturnType<typeof verifyAndConfirmPayment> extends Promise<infer T>
    ? T
    : never,
  reference: string
): PaymentBannerResult {
  switch (outcome) {
    case "confirmed":
      return { kind: "confirmed", reference };
    case "already_paid":
      return { kind: "already_paid", reference };
    case "failed":
      return { kind: "failed", reference };
    case "amount_mismatch":
      return { kind: "amount_mismatch", reference };
    case "not_found":
    case "not_payable":
    case "verify_failed":
      return { kind: "abandoned", reference };
  }
}
