"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ClipboardList,
  MapPin,
  PackageCheck,
  Truck,
} from "lucide-react";
import { useOrders } from "@/components/orders/OrdersProvider";
import { getDeliveryOptionById } from "@/lib/data";
import { btnPrimary, containerClass } from "@/lib/ui";
import { cn, formatPrice, MARKET_CONFIG } from "@/lib/utils";
import type { Order } from "@/types";

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(MARKET_CONFIG.locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const delivery = getDeliveryOptionById(order.deliveryOptionId);
  const deliveryDate = new Date(
    order.estimatedDeliveryISO
  ).toLocaleDateString(MARKET_CONFIG.locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const detailsId = `order-details-${order.id}`;
  const address = order.shippingAddress;
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

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

      {open && (
        <div id={detailsId} className="border-t border-zinc-200 bg-zinc-50/60 px-5 py-5 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
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
        </div>
      )}
    </li>
  );
}

export default function OrdersPage() {
  const { orders, count } = useOrders();

  if (count === 0) {
    return (
      <div className={containerClass}>
        <header className="py-8 lg:py-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            Your orders
          </h1>
        </header>
        <div className="mb-16 flex flex-col items-center rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-400">
            <ClipboardList aria-hidden="true" className="size-8" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-zinc-900">
            No orders yet
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            When you place an order at checkout it will appear here, along with
            its delivery estimate — all stored on this device.
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
          {count} simulated order{count === 1 ? "" : "s"} stored on this device.
        </p>
      </header>

      <ul className="space-y-5 pb-16">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ul>
    </div>
  );
}
