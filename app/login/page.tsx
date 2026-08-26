"use client";

import { useActionState } from "react";
import { loginAction, LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/Button";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null
  );

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-forest text-forest font-display text-xl mb-3">
            U
          </div>
          <h1 className="font-display text-2xl text-forest-dark">
            Umoja SACCO Manager
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            Sign in to your account
          </p>
        </div>

        <form
          action={formAction}
          className="bg-paper-raised border border-line rounded-sm p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-wide text-ink-soft mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-paper focus:bg-paper-raised outline-none"
              placeholder="you@sacco.coop"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-wide text-ink-soft mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-paper focus:bg-paper-raised outline-none"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-rust bg-rust-light border border-rust/30 rounded-sm px-3 py-2">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-xs text-ink-soft text-center mt-6">
          Demo accounts — Admin: admin@sacco.coop / admin123 &nbsp;·&nbsp;
          Member: jane@example.com / member123
        </p>
      </div>
    </main>
  );
}
