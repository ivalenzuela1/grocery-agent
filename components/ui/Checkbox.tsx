"use client";

import { cn } from "@/lib/cn";

export function Checkbox({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("group flex items-center gap-3 text-left", className)}
    >
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition-colors",
          checked
            ? "border-primary bg-primary text-white"
            : "border-border bg-surface text-transparent",
        )}
      >
        <svg
          viewBox="0 0 20 20"
          className={cn("h-4 w-4", checked && "animate-pop")}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 10l4 4 8-9" />
        </svg>
      </span>
      {label ? <span className="text-[15px]">{label}</span> : null}
    </button>
  );
}
