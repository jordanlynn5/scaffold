import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Twilio's WhatsApp sandbox (spec.md > External Services > Twilio).
// Plain HTTP calls, so there is no Twilio library to install.

function settings() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) throw new Error("Twilio keys are missing.");
  return { sid, token, from };
}

// The shared sandbox number and the code word people send to join it, for
// the connection notice on Home.
export function sandboxJoin() {
  const number = (process.env.TWILIO_WHATSAPP_FROM ?? "").replace(/^whatsapp:/, "");
  const code = (process.env.TWILIO_SANDBOX_JOIN_CODE ?? "").trim();
  const message = /^join /i.test(code) ? code : `join ${code}`;
  return { number, message };
}

// Sends one WhatsApp message. Returns Twilio's message id.
export async function sendWhatsApp(to: string, body: string): Promise<string> {
  const { sid, token, from } = settings();
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: `whatsapp:${to}`, Body: body }),
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.sid) {
    throw new Error(`Twilio refused the message: ${data.message ?? response.status}`);
  }
  return data.sid as string;
}

// Did this request really come from Twilio? Twilio signs the full address it
// called plus every form field, sorted by name, with our Auth Token.
// https://www.twilio.com/docs/usage/webhooks/webhooks-security
export function isFromTwilio(
  url: string,
  fields: Record<string, string>,
  signature: string | null,
): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token || !signature) return false;
  const signed =
    url +
    Object.keys(fields)
      .sort()
      .map((key) => key + fields[key])
      .join("");
  const expected = createHmac("sha1", token).update(signed).digest();
  const given = Buffer.from(signature, "base64");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
