import { cn } from "@/lib/cn";

/**
 * Sticky action bar anchored to the bottom of the viewport for thumb reach.
 * Place the primary CTA(s) inside.
 */
export function BottomBar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-border bg-surface/85 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md shadow-[var(--shadow-bar)]">
      <div className={cn("mx-auto flex max-w-xl gap-3", className)}>
        {children}
      </div>
    </div>
  );
}
