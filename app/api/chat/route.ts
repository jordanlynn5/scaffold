import { onboardingTurn } from "@/lib/onboarding/flow";
import type { ChatEvent } from "@/lib/onboarding/steps";
import { findProfile } from "@/lib/profile";

// Streams a teammate's reply (spec.md > File Structure). The reply travels
// as one JSON event per line, so the words appear as they are written.
// Talk to Team joins this route in checklist slice 10.
export async function POST(request: Request) {
  const profile = await findProfile();
  if (!profile) return Response.json({ error: "Log in first." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (body?.kind !== "onboarding") {
    return Response.json({ error: "Unknown conversation." }, { status: 400 });
  }
  const text =
    typeof body.message === "string" ? body.message.trim().slice(0, 600) : "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: ChatEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        await onboardingTurn(profile.id, text || null, emit);
      } catch (error) {
        console.error("Onboarding turn failed", error);
        emit({ type: "error" });
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
