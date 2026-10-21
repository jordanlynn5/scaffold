"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isEmail } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Field, FieldError } from "@/components/ui/Field";

export function PasswordRecovery({ mode }: { mode: "request" | "reset" }) {
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(mode === "request");
  const [sent, setSent] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "reset") return;
    const client = createClient();
    // Also handles older email links that deliver the session in the fragment.
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const callbackError = new URLSearchParams(window.location.search).get("error");
    const expired = fragment.has("error") || callbackError === "expired";
    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (expired) {
        setError("That reset link has expired or was already used. Request a new one below.");
      } else if (callbackError === "browser") {
        setError("This browser couldn’t match the reset request. Request a new link here, then open the newest email in this same browser on this device.");
      } else if (callbackError) {
        setError("We couldn’t verify that reset link. Request a new one here and open only the newest email in this browser.");
      } else if (sessionError || !data.session) {
        setError("Open the link from your reset email in the same browser where you requested it. If it has expired, request a new one below.");
      } else {
        setReady(true);
      }
    }).catch(() => setError("Couldn't check your reset link. Please request a new one."));
  }, [mode]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    setError("");
    const client = createClient();
    if (mode === "request") {
      const email = String(form.get("email") ?? "").trim();
      if (!isEmail(email)) { setError("Enter a valid email address."); return; }
      setPending(true);
      try {
        const { error: sendError } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (sendError) {
          setError(sendError.status === 429
            ? "Too many reset requests. Wait a few minutes, then try again."
            : "The reset email couldn't be sent. Please try again shortly.");
        } else setSent(true);
      } catch { setError("Couldn't connect. Please try again."); }
      finally { setPending(false); }
      return;
    }
    const password = String(form.get("password") ?? "");
    if (password.length < 8) { setError("Choose a password with at least 8 characters."); return; }
    if (password !== form.get("confirmation")) { setError("The two passwords don't match."); return; }
    setPending(true);
    try {
      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.code === "same_password"
          ? "Choose a password different from your old one."
          : "Couldn't update your password. Request a fresh reset link and try again.");
      } else {
        await client.auth.signOut();
        setComplete(true);
      }
    } catch { setError("Couldn't connect. Please try again."); }
    finally { setPending(false); }
  }

  return <div className="flex flex-col gap-5">
    <h2 className="text-h1">{complete ? "Your password is updated" : mode === "request" ? "Forgot your password?" : "Set a new password"}</h2>
    {complete ? <p className="text-body text-text-secondary">Log in with your new password to pick up where you left off.</p>
      : sent ? <p role="status" className="text-body text-text-secondary">If an account exists for that email, a reset link is on its way. Check your inbox and spam folder. Open only the newest reset email, in this same browser on this device.</p>
      : <>
        <p className="text-body-sm text-text-secondary">{mode === "request" ? "Enter the email you used for Scaffold. We'll email you a link to choose a new password." : "Choose a new password for your Scaffold account."}</p>
        {ready ? <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === "request" ? <Field id="email" label="Email" type="email" autoComplete="email" required /> : <>
            <Field id="password" label="New password" type="password" autoComplete="new-password" minLength={8} required hint="At least 8 characters." />
            <Field id="confirmation" label="Confirm new password" type="password" autoComplete="new-password" minLength={8} required />
          </>}
          <Button disabled={pending}>{pending ? "Please wait…" : mode === "request" ? "Send reset link" : "Save new password"}</Button>
        </form> : !error ? <p role="status">Checking your reset link…</p> : null}
      </>}
    {error ? <div role="alert"><FieldError>{error}</FieldError></div> : null}
    {mode === "reset" && !complete ? <Link href="/forgot-password" className="self-start text-navy underline">Request a new reset link</Link> : null}
    <Link href="/log-in" className="self-start text-navy underline">Back to log in</Link>
  </div>;
}
