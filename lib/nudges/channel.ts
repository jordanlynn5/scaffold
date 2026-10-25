// WhatsApp or email? (spec.md > Components > Nudge Sender, channel rule)
// The free WhatsApp sandbox can only message someone who joined in the last
// 3 days and wrote to it in the last 24 hours. That is the platform's rule,
// not a preference. Anyone outside it gets the same message by email.
// No imports, so scripts/check-nudges.mjs can test it directly.

const HOUR = 60 * 60 * 1000;
export const REPLY_WINDOW_HOURS = 24;
export const JOIN_LASTS_DAYS = 3;

export type ChannelFacts = {
  whatsapp: string | null;
  whatsapp_consent: boolean;
  whatsapp_joined_at: string | null;
  whatsapp_last_inbound_at: string | null;
};

// Why WhatsApp can't be used right now, or null when it can.
export type Blocked = "switched-off" | "no-consent" | "no-number" | "not-joined" | "quiet";

// Sending is enabled explicitly after connecting an upgraded Twilio account.
// Unconfigured environments keep using email.
export function whatsappSwitchedOn() {
  return process.env.WHATSAPP_SENDING === "on";
}

export function whatsappBlocked(
  person: ChannelFacts,
  now = new Date(),
  switchedOn = whatsappSwitchedOn(),
): Blocked | null {
  if (!switchedOn) return "switched-off";
  if (!person.whatsapp_consent) return "no-consent";
  if (!person.whatsapp) return "no-number";
  const since = (at: string | null) =>
    at ? now.getTime() - new Date(at).getTime() : Infinity;
  if (since(person.whatsapp_joined_at) >= JOIN_LASTS_DAYS * 24 * HOUR) return "not-joined";
  if (since(person.whatsapp_last_inbound_at) >= REPLY_WINDOW_HOURS * HOUR) return "quiet";
  return null;
}

export function chooseChannel(
  person: ChannelFacts,
  now = new Date(),
  switchedOn = whatsappSwitchedOn(),
): "whatsapp" | "email" {
  return whatsappBlocked(person, now, switchedOn) ? "email" : "whatsapp";
}
