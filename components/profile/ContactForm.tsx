"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveContact, type ContactState } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, FieldError } from "@/components/ui/Field";

// Handoff §6.10 card 4: Email and WhatsApp number, 2 columns on desktop,
// with Save changes. The name is here too, so everything can be edited.
export function ContactForm({
  initial,
}: {
  initial: { name: string; email: string; whatsapp: string };
}) {
  const [state, action, pending] = useActionState<ContactState, FormData>(
    saveContact,
    {},
  );
  const values = state.values ?? initial;
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state]);

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-h3">Contact details</h2>
      <form ref={formRef} action={action} noValidate className="flex flex-col gap-4">
        <Field
          id="name"
          label="Name"
          autoComplete="given-name"
          placeholder="What should the team call you?"
          defaultValue={values.name}
          error={state.errors?.name}
        />
        <div className="grid grid-cols-1 gap-4 desk:grid-cols-2">
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            defaultValue={values.email}
            error={state.errors?.email}
            hint="You also log in with this."
          />
          <Field
            id="whatsapp"
            label="WhatsApp number"
            type="tel"
            autoComplete="tel"
            required
            defaultValue={values.whatsapp}
            error={state.errors?.whatsapp}
            hint="Include your country code."
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <div aria-live="polite" className="text-body-sm text-text-secondary">
            {state.formError ? (
              <FieldError>{state.formError}</FieldError>
            ) : state.saved && !pending ? (
              "Saved."
            ) : null}
          </div>
        </div>
      </form>
    </Card>
  );
}
