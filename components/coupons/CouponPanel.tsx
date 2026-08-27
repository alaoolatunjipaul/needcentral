"use client";

import { useId, useState, type FormEvent } from "react";
import { BadgeCheck, Tag, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useCoupons } from "@/components/coupons/CouponProvider";
import { getCouponByCode } from "@/lib/data";
import {
  cn,
  couponDiscountCents,
  couponQualifies,
  formatPrice,
} from "@/lib/utils";

interface CouponPanelProps {
  className?: string;
}

/**
 * Simulated promo-code entry shared by the cart and checkout summaries.
 * One coupon can be active at a time; re-entering it is a no-op with a
 * friendly message, entering a different valid code replaces it.
 */
export function CouponPanel({ className }: CouponPanelProps) {
  const { items } = useCart();
  const { coupon, applyCoupon, removeCoupon } = useCoupons();
  const inputId = `${useId()}-coupon-input`;
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{
    tone: "error" | "info" | "success";
    text: string;
  } | null>(null);

  const subtotalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );
  const discountCents =
    coupon !== null ? couponDiscountCents(subtotalCents, coupon) : 0;
  const qualifies = coupon !== null && couponQualifies(subtotalCents, coupon);
  const remainingForMinimum =
    coupon?.minSubtotalCents !== undefined
      ? coupon.minSubtotalCents - subtotalCents
      : 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setMessage({ tone: "error", text: "Enter a promo code to apply." });
      return;
    }
    if (coupon?.code === normalized) {
      setMessage({
        tone: "info",
        text: `${normalized} is already applied to your order.`,
      });
      return;
    }
    const matched = getCouponByCode(normalized);
    if (!matched) {
      setMessage({
        tone: "error",
        text: `“${normalized}” isn’t a valid promo code. Try WELCOME10.`,
      });
      return;
    }
    applyCoupon(matched);
    setCode("");
    setMessage({
      tone: "success",
      text: `${matched.code} applied — ${matched.description.toLowerCase()}.`,
    });
  }

  function handleRemove() {
    const removedCode = coupon?.code;
    removeCoupon();
    setMessage({
      tone: "info",
      text:
        removedCode !== undefined
          ? `${removedCode} removed from your order.`
          : "Promo code removed.",
    });
  }

  return (
    <div className={cn("rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200", className)}>
      {coupon === null ? (
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Promo code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id={inputId}
              name="promoCode"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. WELCOME10"
              autoComplete="off"
              aria-invalid={message?.tone === "error" || undefined}
              aria-describedby={message ? `${inputId}-message` : undefined}
              className="w-full min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm uppercase text-zinc-900 placeholder:normal-case placeholder:text-zinc-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 active:scale-[0.98]"
            >
              Apply
            </button>
          </div>
          {message !== null && (
            <p
              id={`${inputId}-message`}
              role={message.tone === "error" ? "alert" : "status"}
              className={cn(
                "mt-2 text-xs leading-5",
                message.tone === "error" && "font-medium text-rose-600",
                message.tone === "info" && "text-zinc-500",
                message.tone === "success" && "font-medium text-emerald-600"
              )}
            >
              {message.text}
            </p>
          )}
          <p className="mt-2 text-[11px] leading-4 text-zinc-400">
            Demo codes: WELCOME10 · NAIJA15 (simulated — nothing is charged)
          </p>
        </form>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg",
                  qualifies
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-amber-100 text-amber-600"
                )}
              >
                {qualifies ? (
                  <BadgeCheck className="size-4.5" />
                ) : (
                  <Tag className="size-4.5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
                  {coupon.code}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                      qualifies
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-amber-50 text-amber-700 ring-amber-200"
                    )}
                  >
                    {qualifies ? "Applied" : "Locked"}
                  </span>
                </p>
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {coupon.description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              aria-label={`Remove coupon ${coupon.code}`}
              className="grid size-8 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <p
            role="status"
            className={cn(
              "mt-3 border-t border-zinc-200 pt-3 text-xs font-semibold",
              qualifies ? "text-emerald-600" : "text-amber-600"
            )}
          >
            {qualifies
              ? `You save ${formatPrice(discountCents)} on this order.`
              : `Spend ${formatPrice(remainingForMinimum)} more to unlock ${coupon.code} — no discount yet.`}
          </p>

          {message !== null && message.tone !== "success" && (
            <p
              role={message.tone === "error" ? "alert" : "status"}
              className="mt-1.5 text-xs leading-5 text-zinc-500"
            >
              {message.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
