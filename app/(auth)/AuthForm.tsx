"use client";

import Link from "next/link";
import { useActionState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { logIn, signUp, type AuthState } from "./actions";

const noop = () => () => {};

// The time zone comes from the browser, so "9:00" means 9:00 where you are.
function useTimezone() {
  return useSyncExternalStore(
    noop,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => "",
  );
}

export function AuthForm({ mode }: { mode: "sign-up" | "log-in" }) {
  const isSignUp = mode === "sign-up";
  const [state, action, pending] = useActionState<AuthState, FormData>(
    isSignUp ? signUp : logIn,
    {},
  );
  const timezone = useTimezone();

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-body-sm text-text-secondary">
          {isSignUp
            ? "You're the builder. Your team is ready when you are."
            : "Log in to pick up where you left off."}
        </p>
      </div>

      <form action={action} className="flex flex-col gap-4">
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={isSignUp ? 8 : undefined}
          hint={isSignUp ? "At least 8 characters." : undefined}
        />
        {isSignUp ? (
          <>
            <Field
              id="whatsapp"
              label="WhatsApp number"
              type="tel"
              autoComplete="tel"
              required
              placeholder="+34 612 345 678"
              defaultValue={state.whatsapp}
              hint="With your country code. Sarah, your Site Lead, sends your daily task here."
            />
            <input type="hidden" name="timezone" value={timezone} />
          </>
        ) : null}

        {/* A quiet box, never red: red is reserved (handoff §2.1). */}
        <div aria-live="polite">
          {state.error ? (
            <p className="rounded-input bg-bg p-3.5 text-body-sm text-ink">
              {state.error}
            </p>
          ) : null}
        </div>

        <Button type="submit" fullWidth disabled={pending}>
          {isSignUp
            ? pending
              ? "Creating your account…"
              : "Create account"
            : pending
              ? "Logging in…"
              : "Log in"}
        </Button>
      </form>

      <p className="text-body-sm text-text-secondary">
        {isSignUp ? "Already have an account? " : "New here? "}
        <Link
          href={isSignUp ? "/log-in" : "/sign-up"}
          className="inline-flex min-h-11 items-center font-medium text-navy hover:underline"
        >
          {isSignUp ? "Log in" : "Create an account"}
        </Link>
      </p>
    </Card>
  );
}
