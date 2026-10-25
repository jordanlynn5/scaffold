import { recordInbound } from "@/lib/nudges/inbound";
import { isFromTwilio } from "@/lib/nudges/whatsapp";

// Twilio calls this for every WhatsApp message sent to the sandbox
// (spec.md > Components > WhatsApp Inbox). Slice 6 checks the message is
// really from Twilio and records when you joined and last wrote, which
// reopens the 24-hour window. Marking a task done by reply is slice 7.

// An empty reply: Twilio sends nothing back to the phone.
const empty = () =>
  new Response("<Response></Response>", { headers: { "Content-Type": "text/xml" } });

export async function POST(request: Request) {
  const form = await request.formData();
  const fields: Record<string, string> = {};
  for (const [key, value] of form) if (typeof value === "string") fields[key] = value;

  // Twilio signs the public address it was given, so check against that
  // rather than whatever address this server thinks it has.
  const url = `${(process.env.APP_URL ?? "").replace(/\/$/, "")}/api/whatsapp/inbound`;
  if (!isFromTwilio(url, fields, request.headers.get("x-twilio-signature"))) {
    return new Response("Not allowed.", { status: 403 });
  }

  await recordInbound(fields.From ?? "", fields.Body ?? "");
  return empty();
}
