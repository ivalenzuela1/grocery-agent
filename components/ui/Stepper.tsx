"use client";

import { cn } from "@/lib/cn";

/**
 * Quantity stepper: − value + . Quantities can be fractional (e.g. 0.5 lb),
 * so step defaults to 1 but accepts decimals; values are clamped at >= 0.
 */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  unit,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  unit?: string;
  className?: string;
}) {
  const round = (n: number) => Math.round(n * 100) / 100;
  const dec = () => onChange(round(Math.max(min, value - step)));
  const inc = () => onChange(round(value + step));

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface",
        className,
      )}
    >
      <button
        type="button"
        onClick={dec}
        aria-label="Decrease"
        className="grid h-10 w-10 place-items-center rounded-full text-xl text-ink active:scale-90 transition-transform disabled:opacity-40"
        disabled={value <= min}
      >
        −
      </button>
      <span className="min-w-14 text-center text-[15px] font-semibold tabular-nums">
        {value}
        {unit ? <span className="ml-1 font-normal text-muted">{unit}</span> : null}
      </span>
      <button
        type="button"
        onClick={inc}
        aria-label="Increase"
        className="grid h-10 w-10 place-items-center rounded-full text-xl text-ink active:scale-90 transition-transform"
      >
        +
      </button>
    </div>
  );
}
