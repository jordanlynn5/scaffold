import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

// The one place that calls Claude (spec.md > Components > Team Brains).
// Chat and nudges use Haiku. Plans choose their own model (PLAN_MODEL).
export const CHAT_MODEL = "claude-haiku-5-5";

let client: Anthropic | undefined;
function claude() {
  // Reads ANTHROPIC_API_KEY from the environment.
  return (client ??= new Anthropic());
}

// What was said so far. A teammate's lines are "assistant", yours are "user".
export type Turn = { role: "user" | "assistant"; content: string };

// Asks for a teammate's next message and hands over each piece as it is
// written. Returns the whole message. Throws if it fails or is cut short.
export async function streamReply({
  system,
  turns,
  onText,
}: {
  system: string;
  turns: Turn[];
  onText: (piece: string) => void;
}): Promise<string> {
  const stream = claude().messages.stream({
    model: CHAT_MODEL,
    max_tokens: 1024,
    system,
    messages: turns,
  });
  stream.on("text", onText);
  const message = await stream.finalMessage();
  if (message.stop_reason !== "end_turn") {
    throw new Error(`Reply stopped early: ${message.stop_reason}`);
  }
  return message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
}

// Asks a question whose answer must come back in a fixed shape, such as
// "is this specific: yes or no". Returns null if it fails.
export async function readFacts<T>({
  system,
  text,
  shape,
}: {
  system: string;
  text: string;
  shape: z.ZodType<T>;
}): Promise<T | null> {
  try {
    const response = await claude().messages.parse({
      model: CHAT_MODEL,
      max_tokens: 256,
      system,
      messages: [{ role: "user", content: text }],
      output_config: { format: zodOutputFormat(shape) },
    });
    return response.parsed_output ?? null;
  } catch {
    return null;
  }
}
