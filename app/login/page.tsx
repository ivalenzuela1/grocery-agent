"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initial: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-rise text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-2xl text-white shadow-[var(--shadow-card)]">
          ✿
        </div>
        <h1 className="text-2xl font-semibold">Fresh Cart</h1>
        <p className="mt-1 text-muted">Plan the week. Approve. Done.</p>

        <form action={formAction} className="mt-8 space-y-3 text-left">
          <Input
            name="password"
            type="password"
            autoFocus
            autoComplete="current-password"
            placeholder="Household password"
            aria-label="Household password"
          />
          {state.error ? (
            <p className="text-sm text-danger">{state.error}</p>
          ) : null}
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Unlocking…" : "Unlock"}
          </Button>
        </form>
      </div>
    </main>
  );
}
