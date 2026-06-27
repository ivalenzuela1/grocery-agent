import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-sm text-white"
          >
            ✿
          </span>
          <span className="tracking-tight">Fresh Cart</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/staples"
            className="rounded-full px-3 py-1.5 text-muted hover:bg-surface hover:text-ink"
          >
            Staples
          </Link>
          <Link
            href="/preferences"
            className="rounded-full px-3 py-1.5 text-muted hover:bg-surface hover:text-ink"
          >
            Preferences
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full px-3 py-1.5 text-muted hover:bg-surface hover:text-ink"
            >
              Lock
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
