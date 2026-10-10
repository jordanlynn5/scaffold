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

// Nudge times come in 15-minute steps, because the bell rings every 15
// minutes (spec.md > What Was Simplified and Why).
export const nudgeTimes = Array.from({ length: 96 }, (_, i) => {
  const hours = String(Math.floor(i / 4)).padStart(2, "0");
  const minutes = String((i % 4) * 15).padStart(2, "0");
  return `${hours}:${minutes}`;
});

export const messages = {
  email: "That email doesn't look complete. Check it and try again.",
  whatsapp:
    "Write your number with its country code, starting with +. For example +34 600 000 000.",
};
