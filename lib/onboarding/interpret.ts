import "server-only";
import { z } from "zod";
import { readFacts } from "@/lib/ai/client";
import type { OnboardingStep } from "./steps";

// Turning what someone typed into the thing that gets saved.

// "call me Jo" → "Jo"
export function readName(text: string) {
  const name = text
    .replace(/^\s*(hi|hello|hey)[,!. ]+/i, "")
    .replace(/^\s*(you can )?(call me|i'm|i am|im|my name is|my name's|it's|its|just)\s+/i, "")
    .replace(/[.!]+$/, "")
    .trim();
  return name.length > 0 && name.length <= 60 ? name : null;
}

// "Evening 19:00", "7pm", "7.30 in the evening" → "19:00", "19:00", "19:30".
// Rounded to the nearest quarter hour, because the bell rings every 15 minutes.
export function readTime(text: string) {
  const lower = text.toLowerCase();
  if (/\b(noon|midday)\b/.test(lower)) return "12:00";
  if (/\bmidnight\b/.test(lower)) return "00:00";

  const match = lower.match(/(\d{1,2})(?:\s*[:.h]\s*(\d{2}))?\s*(a\.?m\b|p\.?m\b)?/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const half = match[3]?.[0];
  if (hours > 23 || minutes > 59) return null;
  if (half === "p" && hours < 12) hours += 12;
  if (half === "a" && hours === 12) hours = 0;
  if (!half && hours >= 1 && hours <= 11 && /evening|night|afternoon/.test(lower)) {
    hours += 12;
  }
  const quarters = Math.round((hours * 60 + minutes) / 15) % 96;
  const hh = String(Math.floor(quarters / 4)).padStart(2, "0");
  const mm = String((quarters % 4) * 15).padStart(2, "0");
  return `${hh}:${mm}`;
}

const numberWords = ["one", "two", "three", "four", "five", "six", "seven"];

// "4 days", "three", "every day" → 4, 3, 7
export function readDays(text: string) {
  const lower = text.toLowerCase();
  const digits = lower.match(/\d+/);
  if (digits) {
    const days = Number(digits[0]);
    return days >= 1 && days <= 7 ? days : null;
  }
  const word = numberWords.findIndex((w) => new RegExp(`\\b${w}\\b`).test(lower));
  if (word >= 0) return word + 1;
  if (/every ?day|daily/.test(lower)) return 7;
  if (/weekdays/.test(lower)) return 5;
  return null;
}

const questions: Partial<Record<OnboardingStep, string>> = {
  wish: "what they want to accomplish (their goal)",
  experience: "whether they have done any of this before",
  outcome: "the best thing about having reached their goal",
  obstacle: "the main thing inside them that gets in the way",
};

const reading = z.object({
  answered: z.boolean(),
  specific: z.boolean(),
});

// Did they answer the question, and is the answer specific enough to plan
// around? If Claude cannot be asked, the answer is taken as it stands.
export async function readAnswer(step: OnboardingStep, text: string) {
  const result = await readFacts({
    system: `Someone setting a personal goal was asked ${questions[step]}. Their reply follows. Decide two things.

answered: true if the reply is an answer to that question, even a short or rough one. false if it is something else, such as a question back, a request for help, or a remark about another subject.

specific: true if the reply names something concrete enough to plan around, such as a particular habit, feeling, thought or situation. false for general statements like "life gets busy", "no time" or "stuff comes up", which could be said about anything.`,
    text,
    shape: reading,
  });
  return result ?? { answered: true, specific: true };
}
