// Shared checks for what people type into forms.

export function isEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

// "+34 612 34 56 78" → "+34612345678" (the E.164 format). Returns null if it
// isn't a full international number.
export function normalizeWhatsapp(input: string) {
  const digits = input.replace(/[\s\-().]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

// Nudge times are on the hour, because the bell rings once an hour
// (spec.md > What Was Simplified and Why).
export const nudgeTimes = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`,
);

export const messages = {
  email: "That email doesn't look complete. Check it and try again.",
  whatsapp:
    "Write your number with its country code, starting with +. For example +34 600 000 000.",
};
