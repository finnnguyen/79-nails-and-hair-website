"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-20">
      <h1 className="font-display text-3xl text-foreground">Staff Login</h1>
      <p className="mt-2 text-sm text-muted">Sign in to manage bookings.</p>

      <form action={action} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground">Email</span>
          <input
            type="email"
            name="email"
            required
            className="rounded-sm border border-border bg-surface px-3 py-2.5 text-foreground outline-none focus:border-foreground"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-foreground">Password</span>
          <input
            type="password"
            name="password"
            required
            className="rounded-sm border border-border bg-surface px-3 py-2.5 text-foreground outline-none focus:border-foreground"
          />
        </label>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-sm bg-foreground px-7 py-2.5 text-sm font-medium text-background transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
