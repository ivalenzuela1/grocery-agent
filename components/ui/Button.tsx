import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "ghost" | "danger";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-[transform,background-color,opacity] active:scale-[0.98] " +
  "disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-press focus-visible:ring-primary",
  accent:
    "bg-accent text-white hover:bg-accent-press focus-visible:ring-accent shadow-[var(--shadow-card)]",
  ghost:
    "bg-surface text-ink border border-border hover:bg-background focus-visible:ring-primary",
  danger:
    "bg-danger-soft text-danger hover:bg-danger hover:text-white focus-visible:ring-danger",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 text-[15px]",
  lg: "min-h-13 px-6 text-base w-full",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(base, variants[variant], sizes[size]);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button className={cn(buttonClasses(variant, size), className)} {...props} />
  );
}
