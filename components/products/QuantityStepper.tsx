"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md";
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
  label = "Quantity",
  size = "md",
}: QuantityStepperProps) {
  const buttonClass =
    size === "sm"
      ? "size-7 rounded-lg"
      : "size-9 rounded-xl";
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-xl border border-zinc-300 bg-white p-0.5"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className={cn(
          "grid place-items-center text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-40",
          buttonClass
        )}
      >
        <Minus aria-hidden="true" className={iconSize} />
      </button>
      <span
        aria-live="polite"
        className="min-w-8 text-center text-sm font-semibold tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className={cn(
          "grid place-items-center text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-40",
          buttonClass
        )}
      >
        <Plus aria-hidden="true" className={iconSize} />
      </button>
    </div>
  );
}
