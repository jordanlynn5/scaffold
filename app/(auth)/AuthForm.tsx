"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FieldError } from "@/components/ui/Field";
import { logIn, signUp, type AuthState } from "./actions";

const noop = () => () => {};
const linkClass = "font-semibold text-navy underline-offset-2 hover:underline";

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
  const formRef = useRef<HTMLFormElement>(null);

  // After a failed submit, move focus to the first field with a problem.
  useEffect(() => {
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state]);

  const emailError = state.emailTaken ? (
    <>
      There&apos;s already an account with this email.{" "}
      <Link href="/log-in" className={linkClass}>
        Log in instead?
      </Link>
    </>
  ) : (
    state.errors?.email
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        {/* On desktop the navy panel holds the page's h1. */}
        <h2 className="text-h1">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-body-sm text-text-secondary">
          {isSignUp ? "Already have one? " : "New here? "}
          <Link
            href={isSignUp ? "/log-in" : "/sign-up"}
            className={`inline-flex min-h-11 items-center ${linkClass}`}
          >
            {isSignUp ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>

      <form ref={formRef} action={action} noValidate className="flex flex-col gap-[18px]">
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          defaultValue={state.values?.email}
          error={emailError}
        />
        {isSignUp ? (
          <Field
            id="whatsapp"
            label="WhatsApp number"
            type="tel"
            autoComplete="tel"
            placeholder="+34 600 000 000"
            required
            defaultValue={state.values?.whatsapp}
            error={state.errors?.whatsapp}
            hint="Sarah, your Site Lead, sends your daily task here. Include your country code."
          />
        ) : null}
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          error={state.errors?.password}
          hint={isSignUp ? "At least 8 characters." : undefined}
        />

        {isSignUp ? (
          <>
            <label className="flex cursor-pointer items-start gap-3 rounded-input border border-input-border bg-surface p-3.5 text-body-sm text-ink">
              <input
                type="checkbox"
                name="consent"
                defaultChecked={state.values?.consent ?? false}
                className="mt-0.5 size-[22px] shrink-0 accent-navy"
              />
              <span>
                Yes, send me one message a day on WhatsApp with my task. I can
                stop it any time.
              </span>
            </label>
            <input type="hidden" name="timezone" value={timezone} />
          </>
        ) : null}

        <div aria-live="polite">
          {state.formError ? <FieldError>{state.formError}</FieldError> : null}
        </div>

        <Button type="submit" fullWidth disabled={pending} className="min-h-[54px]">
          {isSignUp
            ? pending
              ? "Creating your account…"
              : "Create account →"
            : pending
              ? "Logging in…"
              : "Log in →"}
        </Button>

        {isSignUp ? (
          // PLACEHOLDER links: the Terms and Privacy Policy are not written yet.
          <p className="text-[13px] text-text-muted">
            By creating an account you agree to the{" "}
            <a href="#" className={linkClass}>
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className={linkClass}>
              Privacy Policy
            </a>
            .
          </p>
        ) : null}
      </form>
    </div>
  );
}
