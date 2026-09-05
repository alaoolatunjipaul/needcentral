"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  MapPin,
  PackageCheck,
  PackageX,
  RotateCcw,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useOrders } from "@/components/orders/OrdersProvider";
import { getDeliveryOptionById } from "@/lib/data";
import { btnPrimary, containerClass, inputBase } from "@/lib/ui";
import { cn, formatPrice, MARKET_CONFIG } from "@/lib/utils";
import type { Order, ReturnStatus } from "@/types";
import type { PaymentBannerResult } from "./page";
import {
  approveReturnAction,
  markOrderDelivered,
  markOrderShipped,
  markReturnRefundedAction,
  rejectReturnAction,
  requestReturnAction,
} from "./actions";

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: "Requested",
  refund_pending_manual: "Approved · refund pending manual",
  rejected: "Rejected",
  refunded: "Refunded",
};

const RETURN_WINDOW_DAYS = 30;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(MARKET_CONFIG.locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(MARKET_CONFIG.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function canRequestReturn(order: Order): boolean {
  if (order.status !== "delivered" && order.status !== "confirmed") return false;
  const anchor = order.deliveredAtISO ?? order.paidAtISO ?? order.placedAtISO;
  const cutoff = new Date(
    new Date(anchor).getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );
  return Date.now() <= cutoff.getTime();
}

function ReturnBadge({ status }: { status: ReturnStatus }) {
  const tone =
    status === "rejected"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : status === "refunded"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : "bg-amber-50 text-amber-700 ring-amber-200";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
        tone
      )}
    >
      <RotateCcw aria-hidden="true" className="size-3" />
      {RETURN_STATUS_LABELS[status]}
    </span>
  );
}

function TransitionButton({
  children,
  onClick,
  busy,
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-300 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
      )}
    >
      {children}
    </button>
  );
}

function EventNote({ note }: { note?: string }) {
  if (!note) return null;
  return <p className="mt-0.5 text-xs leading-5 text-zinc-400">{note}</p>;
}

function OrderDetails({ order }: { order: Order }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const delivery = getDeliveryOptionById(order.deliveryOptionId);
  const address = order.shippingAddress;
  const legs = buildTimeline(order);
  const eligible = canRequestReturn(order);
  const openReturn = Boolean(
    order.returns?.some(
      (r) => r.status === "requested" || r.status === "refund_pending_manual"
    )
  );
  const remaining = order.items.filter(
    (item) =>
      !(order.returns ?? []).some(
        (r) =>
          (r.status === "requested" ||
            r.status === "refund_pending_manual" ||
            r.status === "refunded") &&
          r.items.some((i) => i.productId === item.productId)
      )
  );

  const runAction = async (action: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(true);
    setErrorMsg(null);
    const result = await action();
    setBusy(false);
    if (!result.ok) {
      setErrorMsg(result.error ?? "Something went wrong. Please try again.");
    } else {
      router.refresh();
    }
  };

  const toggleItem = (productId: string) =>
    setSelected((prev) => ({ ...prev, [productId]: !prev[productId] }));

  const submitReturn = () =>
    runAction(async () => {
      const entries = order.items
        .filter((item) => selected[item.productId])
        .map((item) => ({ productId: item.productId, quantity: item.quantity }));
      const result = await requestReturnAction(order.id, entries, reason);
      if (result.ok) {
        setRequesting(false);
        setSelected({});
        setReason("");
      }
      return result;
    });

  const approve = (returnId: string) =>
    runAction(() => approveReturnAction(order.id, returnId));

  const reject = (returnId: string) =>
    runAction(async () => {
      const result = await rejectReturnAction(order.id, returnId, rejectReason || "No longer eligible for return.");
      if (result.ok) {
        setRejectingId(null);
        setRejectReason("");
      }
      return result;
    });

  const refund = (returnId: string) =>
    runAction(() => markReturnRefundedAction(order.id, returnId));

  return (
    <div
      id={`order-details-${order.id}`}
      className="border-t border-zinc-200 bg-zinc-50/60 px-5 py-5 sm:px-6"
    >
      {errorMsg && (
        <div
          role="alert"
          className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200"
        >
          {errorMsg}
        </div>
      )}

      {/* Lifecycle timeline */}
      <section aria-label="Order progress" className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200 sm:p-5">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          <PackageCheck aria-hidden="true" className="size-3.5" />
          Progress
        </h4>
        <ol className="mt-3 grid gap-2 sm:grid-cols-3">
          {legs.map((leg, index) => (
            <li key={leg.key} className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                  leg.done
                    ? "bg-brand-600 text-white"
                    : index === 0 && order.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-zinc-100 text-zinc-400"
                )}
              >
                {leg.done ? "✓" : index + 1}
              </span>
              <span>
                <span
                  className={cn(
                    "block text-sm font-semibold",
                    leg.done ? "text-zinc-900" : "text-zinc-400"
                  )}
                >
                  {leg.label}
                </span>
                {leg.atISO && (
                  <span className="block text-xs text-zinc-500">
                    {formatDate(leg.atISO)}
                  </span>
                )}
                {order.status === "cancelled" && leg.key === "confirmed" && (
                  <span className="block text-xs text-rose-600">
                    Cancelled
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
        {order.trackingNumber && (
          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
            <Truck aria-hidden="true" className="size-3.5" />
            Tracking number:{" "}
            <span className="font-mono font-semibold text-zinc-800">
              {order.trackingNumber}
            </span>
            <span className="text-zinc-400">
              · NeedCentral logistics (static tracking this stage)
            </span>
          </p>
        )}
        {order.status === "delivered" && (
          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-emerald-700">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            Delivered{order.deliveredAtISO ? ` on ${formatDate(order.deliveredAtISO)}` : ""}.
          </p>
        )}
        <EventNote note={order.events?.[order.events.length - 1]?.note} />
      </section>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
        <table className="w-full text-sm">
          <caption className="sr-only">Items in order {order.id}</caption>
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-400">
              <th scope="col" className="pb-2 font-semibold">Product</th>
              <th scope="col" className="pb-2 text-center font-semibold">Qty</th>
              <th scope="col" className="pb-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {order.items.map((item) => (
              <tr key={item.productId}>
                <td className="py-2.5 pr-3 text-zinc-700">{item.name}</td>
                <td className="py-2.5 text-center tabular-nums text-zinc-500">
                  {item.quantity}
                </td>
                <td className="py-2.5 text-right font-medium tabular-nums text-zinc-900">
                  {formatPrice(item.priceCents * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-4">
          <dl className="space-y-2 rounded-2xl bg-white p-4 text-sm ring-1 ring-zinc-200">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Subtotal</dt>
              <dd className="font-medium tabular-nums text-zinc-900">
                {formatPrice(order.subtotalCents)}
              </dd>
            </div>
            {order.discountCents !== undefined &&
              order.discountCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-emerald-600">
                    Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                  </dt>
                  <dd className="font-semibold tabular-nums text-emerald-600">
                    -{formatPrice(order.discountCents)}
                  </dd>
                </div>
              )}
            <div className="flex justify-between">
              <dt className="text-zinc-500">
                Delivery{delivery ? ` · ${delivery.label}` : ""}
              </dt>
              <dd
                className={cn(
                  "font-medium tabular-nums",
                  order.shippingCents === 0 ? "text-emerald-600" : "text-zinc-900"
                )}
              >
                {order.shippingCents === 0 ? "Free" : formatPrice(order.shippingCents)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base">
              <dt className="font-bold text-zinc-900">Total paid</dt>
              <dd className="font-extrabold tabular-nums text-zinc-950">
                {formatPrice(order.totalCents)}
              </dd>
            </div>
          </dl>

          {order.pickupStation ? (
            <div className="rounded-2xl bg-white p-4 text-sm ring-1 ring-zinc-200">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                <MapPin aria-hidden="true" className="size-3.5" />
                Pickup station
              </h4>
              <p className="mt-2 leading-6 text-zinc-600">
                {order.pickupStation.name}
                <br />
                {order.pickupStation.address}
                <br />
                <span className="text-zinc-500">
                  Ready in about {order.pickupStation.etaDays} days
                </span>
              </p>
            </div>
          ) : address ? (
            <div className="rounded-2xl bg-white p-4 text-sm ring-1 ring-zinc-200">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                <MapPin aria-hidden="true" className="size-3.5" />
                {order.crossBorder ? "Delivering to (cross-border)" : "Delivering to"}
              </h4>
              <p className="mt-2 leading-6 text-zinc-600">
                {address.fullName}
                <br />
                {address.street}, {address.city} {address.postalCode}
                <br />
                {address.country}
              </p>
            </div>
          ) : null}

          <p className="text-xs leading-5 text-zinc-400">
            Simulated order — no real payment was processed and nothing will ship.
          </p>
        </div>
      </div>

      {/* Fulfillment simulation (order-owner flow this stage) */}
      {(order.status === "confirmed" || order.status === "processing") && (
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Fulfillment (simulated)
          </span>
          <TransitionButton busy={busy} onClick={() => runAction(() => markOrderShipped(order.id))}>
            <Truck aria-hidden="true" className="size-3.5" />
            Mark as shipped
          </TransitionButton>
          {order.status === "processing" && (
            <span className="text-xs text-zinc-400">Tracking number is generated on the first ship step.</span>
          )}
        </div>
      )}
      {order.status === "shipped" && (
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Fulfillment (simulated)
          </span>
          <TransitionButton busy={busy} onClick={() => runAction(() => markOrderDelivered(order.id))}>
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            Mark as delivered
          </TransitionButton>
        </div>
      )}

      {/* Returns */}
      <div className="mt-5 space-y-3">
        {order.status === "cancelled" ? null : eligible && !openReturn ? (
          <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              <ShieldCheck aria-hidden="true" className="size-3.5" />
              Buyer protection — request a return
            </h4>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Eligible within {RETURN_WINDOW_DAYS} days of{" "}
              {order.status === "delivered" ? "delivery" : "confirmation"}.{" "}
              {remaining.length === 0
                ? "All items are already covered by a return."
                : "Choose the items you want to return."}
            </p>
            {requesting ? (
              <div className="mt-3 space-y-3">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {remaining.map((item) => (
                    <label
                      key={item.productId}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-sm transition",
                        selected[item.productId]
                          ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600"
                          : "border-zinc-300 hover:border-zinc-400"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(selected[item.productId])}
                        onChange={() => toggleItem(item.productId)}
                        className="size-4 accent-brand-600"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-zinc-800">
                          {item.name}
                        </span>
                        <span className="block text-xs text-zinc-500 tabular-nums">
                          Qty {item.quantity} · {formatPrice(item.priceCents * item.quantity)}
                        </span>
                      </span>
                    </label>
                  ))}
                </ul>
                <textarea
                  aria-label="Return reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell us why you're returning this (required)"
                  maxLength={500}
                  className={cn(inputBase, "min-h-20 w-full")}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={submitReturn}
                    className={cn(
                      btnPrimary,
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    Submit return request
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setRequesting(false);
                      setSelected({});
                      setReason("");
                    }}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRequesting(true)}
                className={cn(btnPrimary, "mt-3")}
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Request a return
              </button>
            )}
          </div>
        ) : null}

        {(order.returns ?? []).map((returnRow) => (
          <div key={returnRow.id} className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PackageX aria-hidden="true" className="size-4 text-rose-500" />
                <span className="text-sm font-semibold text-zinc-900">
                  Return request
                </span>
                <ReturnBadge status={returnRow.status} />
              </div>
              <span className="text-xs text-zinc-400">
                {formatDateTime(returnRow.requestedAtISO)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{returnRow.reason}</p>
            <ul className="mt-2 space-y-1">
              {returnRow.items.map((item) => (
                <li key={item.productId} className="text-xs text-zinc-500">
                  {item.name} · Qty {item.quantity} ·{" "}
                  {formatPrice(item.priceCents * item.quantity)}
                </li>
              ))}
            </ul>
            {returnRow.refundCents !== undefined &&
              returnRow.refundCents > 0 && (
                <p className="mt-2 text-sm font-semibold text-emerald-700 tabular-nums">
                  Refund: {formatPrice(returnRow.refundCents)} · manual settlement only
                </p>
              )}

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
              {returnRow.status === "requested" && (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => approve(returnRow.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 aria-hidden="true" className="size-3.5" />
                    Approve (refund pending manual)
                  </button>
                  {rejectingId === returnRow.id ? (
                    <div className="flex w-full items-center gap-2">
                      <input
                        aria-label="Rejection reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Rejection reason (required)"
                        maxLength={500}
                        className={cn(inputBase, "min-w-0 flex-1")}
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => reject(returnRow.id)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingId(null)}
                        className="shrink-0 rounded-full px-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRejectingId(returnRow.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-300 transition hover:bg-zinc-50"
                    >
                      <XCircle aria-hidden="true" className="size-3.5" />
                      Reject
                    </button>
                  )}
                </>
              )}
              {returnRow.status === "refund_pending_manual" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => refund(returnRow.id)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 aria-hidden="true" className="size-3.5" />
                  Mark refunded (manual)
                </button>
              )}
              {returnRow.status === "rejected" && returnRow.rejectedReason && (
                <p className="text-xs text-zinc-500">
                  Rejected: {returnRow.rejectedReason}
                </p>
              )}
              {returnRow.status === "refunded" && (
                <p className="text-xs text-emerald-700">
                  Refunded{returnRow.refundedAtISO ? ` on ${formatDate(returnRow.refundedAtISO)}` : ""}. No payment-provider call was made this stage.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildTimeline(order: Order): Array<{
  key: string;
  label: string;
  done: boolean;
  atISO?: string;
}> {
  const confirmed =
    order.paidAtISO ??
    order.events?.find((e) => e.eventType === "confirmed")?.atISO;
  const shipped =
    order.shippedAtISO ??
    order.events?.find((e) => e.eventType === "shipped")?.atISO;
  const delivered =
    order.deliveredAtISO ??
    order.events?.find((e) => e.eventType === "delivered")?.atISO;

  const steps = [
    { key: "confirmed", label: "Confirmed", done: Boolean(confirmed), atISO: confirmed },
    { key: "shipped", label: "Shipped", done: Boolean(shipped), atISO: shipped },
    { key: "delivered", label: "Delivered", done: Boolean(delivered), atISO: delivered },
  ];
  return steps.filter((step) => {
    if (order.status === "pending") return step.key === "confirmed";
    if (order.status === "cancelled") return step.key === "confirmed";
    return true;
  });
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const deliveryDate = new Date(
    order.estimatedDeliveryISO
  ).toLocaleDateString(MARKET_CONFIG.locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const detailsId = `order-details-${order.id}`;
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const hasActiveReturn = Boolean(
    order.returns?.some(
      (r) => r.status === "requested" || r.status === "refund_pending_manual"
    )
  );

  return (
    <li className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200">
      <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className="font-mono text-sm font-bold text-zinc-900">
              {order.id}
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                order.status === "cancelled"
                  ? "bg-rose-50 text-rose-700 ring-rose-200"
                  : order.status === "delivered"
                    ? "bg-brand-50 text-brand-700 ring-brand-200"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-200"
              )}
            >
              <PackageCheck aria-hidden="true" className="size-3" />
              {STATUS_LABELS[order.status]}
            </span>
            {hasActiveReturn && <ReturnBadge status="requested" />}
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            <span>Placed {formatDate(order.placedAtISO)}</span>
            <span className="inline-flex items-center gap-1">
              <Truck aria-hidden="true" className="size-3.5" />
              Est. {order.pickupStation ? "ready at pickup" : "delivery"}{" "}
              {deliveryDate}
              {order.crossBorder && <span aria-hidden="true">· cross-border</span>}
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <div className="text-left lg:text-right">
            <p className="text-xs text-zinc-500">
              {totalQuantity} item{totalQuantity === 1 ? "" : "s"}
            </p>
            <p className="font-bold tabular-nums text-zinc-950">
              {formatPrice(order.totalCents)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={detailsId}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-300 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {open ? "Hide details" : "View details"}
            <ChevronDown
              aria-hidden="true"
              className={cn("size-4 transition-transform", open && "rotate-180")}
            />
          </button>
        </div>
      </div>

      <ul className="flex flex-wrap gap-3 border-t border-zinc-100 px-5 py-4 sm:px-6">
        {order.items.map((item) => (
          <li
            key={item.productId}
            className="flex min-w-0 flex-1 basis-40 items-center gap-2.5"
          >
            <Link
              href={`/products/${item.productId}`}
              className="relative size-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-zinc-200 transition hover:ring-brand-300"
            >
              <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
            </Link>
            <div className="min-w-0 text-xs">
              <p className="truncate font-medium text-zinc-800">{item.name}</p>
              <p className="mt-0.5 text-zinc-500 tabular-nums">
                Qty {item.quantity} · {formatPrice(item.priceCents)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {open && <OrderDetails order={order} />}
    </li>
  );
}

function PaymentBanner({
  paymentResult,
}: {
  paymentResult: NonNullable<PaymentBannerResult>;
}) {
  const messages: Record<
    NonNullable<PaymentBannerResult>["kind"],
    { title: string; body: string; ok: boolean }
  > = {
    confirmed: {
      ok: true,
      title: "Payment received",
      body: `Order ${paymentResult.reference} is confirmed. Thanks for shopping with NeedCentral!`,
    },
    already_paid: {
      ok: true,
      title: "Already confirmed",
      body: `Payment for order ${paymentResult.reference} was already verified.`,
    },
    failed: {
      ok: false,
      title: "Payment not completed",
      body: `We couldn't confirm the payment for order ${paymentResult.reference}. Please try again.`,
    },
    amount_mismatch: {
      ok: false,
      title: "Payment could not be confirmed",
      body: `The payment amount for order ${paymentResult.reference} didn't match your order, so it wasn't confirmed. Contact support if you were charged.`,
    },
    abandoned: {
      ok: false,
      title: "Payment not verified",
      body: `We couldn't verify the payment for order ${paymentResult.reference}. It remains pending.`,
    },
    unknown: {
      ok: false,
      title: "Payment not verified",
      body: "We couldn't verify that payment for this account.",
    },
  };
  const meta = messages[paymentResult.kind];
  const Icon = meta.ok ? CheckCircle2 : XCircle;
  return (
    <div
      role="status"
      className={cn(
        "mb-8 flex items-start gap-3 rounded-2xl px-4 py-3.5 ring-1",
        meta.ok
          ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
          : "bg-rose-50 text-rose-800 ring-rose-200"
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="text-sm font-bold">{meta.title}</p>
        <p className="mt-0.5 text-sm leading-5 opacity-90">{meta.body}</p>
      </div>
    </div>
  );
}

export function OrdersView({
  dbOrders,
  paymentResult,
}: {
  dbOrders: Order[] | null;
  paymentResult?: PaymentBannerResult | null;
}) {
  const { orders: localOrders } = useOrders();
  const { isAuthenticated } = useAuth();

  const isPersisted = dbOrders !== null;
  const orders = isPersisted
    ? [...dbOrders, ...localOrders.filter((local) => !dbOrders.some((db) => db.id === local.id))]
    : localOrders;
  const count = orders.length;

  if (!isAuthenticated && !isPersisted) {
    return (
      <div className={containerClass}>
        <div className="mx-auto max-w-md py-16 sm:py-24">
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <span
              aria-hidden="true"
              className="grid size-16 place-items-center rounded-full bg-zinc-100 text-zinc-400"
            >
              <ClipboardList className="size-8" />
            </span>
            <h1 className="mt-5 text-xl font-bold text-zinc-900">
              Sign in to view your orders
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Track the status, delivery estimate and details of every order —
              saved to your account once you&apos;re signed in.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/signin" className={btnPrimary}>
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-300 transition hover:bg-zinc-50 hover:ring-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98]"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className={containerClass}>
        <header className="py-8 lg:py-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            Your orders
          </h1>
        </header>
        {paymentResult && <PaymentBanner paymentResult={paymentResult} />}
        <div className="mb-16 flex flex-col items-center rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-400">
            <ClipboardList aria-hidden="true" className="size-8" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-zinc-900">
            No orders yet
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            {isPersisted
              ? "When you place an order at checkout it will be saved to your account and available on any device."
              : "When you place an order at checkout it will appear here, along with its delivery estimate — all stored on this device."}
          </p>
          <Link href="/products" className={`${btnPrimary} mt-7`}>
            Start shopping
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <header className="py-8 lg:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
          Your orders
        </h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base" aria-live="polite">
          {count} simulated order{count === 1 ? "" : "s"}{" "}
          {isPersisted ? "stored on your account." : "stored on this device."}
        </p>
      </header>

      {paymentResult && <PaymentBanner paymentResult={paymentResult} />}

      <ul className="space-y-5 pb-16">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ul>
    </div>
  );
}