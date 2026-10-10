import type { OnboardingStep } from "./steps";

// What Alice is asked to say at each step. The questions are the handoff's
// wording (§6.4). Alice adds the reaction to what the builder just said.

export type Variant =
  | "ask" // the question for this step
  | "again" // the last answer couldn't be read (a time, a number)
  | "aside" // the last message wasn't an answer
  | "follow_up"; // the obstacle was too general

type Facts = { name: string | null; whatsappConsent: boolean };

const chipRule = `Finish with one last line in exactly this form, which the app turns into tappable suggestions and never shows as text:
CHIPS: first suggestion | second suggestion | third suggestion
Each suggestion is something the builder could say, written in their voice ("I", not "you"), under eight words.`;

const noChips = "Do not add a CHIPS line to this message.";

const fixedChips: Partial<Record<OnboardingStep, string[]>> = {
  nudge_time: ["Morning 8:00", "Lunchtime 13:00", "Evening 19:00"],
  days: ["3 days", "4 days", "5 days"],
};

function ask(step: OnboardingStep, facts: Facts): string {
  switch (step) {
    case "name":
      return `This is the first message of the chat. Introduce yourself, opening with the words "Hi, I'm Alice, your Architect. You're the builder here" and finishing that thought in a sentence or two: the team plans and supports, the builder lays the bricks, and you have a few quick questions that take about 5 minutes. Then, as its own short paragraph, ask: "What should I call you?"
${noChips}`;
    case "nudge_time":
      return `They have just told you their name. Greet them by it in a few words. Then ask, in these words: "${
        facts.whatsappConsent
          ? "Sarah, your Site Lead, will send you one WhatsApp message a day with your task. When should it arrive?"
          : "Sarah, your Site Lead, will send you one message a day with your task. When should it arrive?"
      }"
${noChips}`;
    case "days":
      return `They have just chosen when their daily message arrives. Confirm the time in a few words. Then ask, in these words: "How many days a week do you want to build? Pick a number that leaves room for real life. You can change it later."
${noChips}`;
    case "wish":
      return `They have just chosen how many days a week to build. Acknowledge it in a few words. Then open the design: say "Now let's design your house. We'll use a method called WOOP" and explain it in one sentence (Wish, Outcome, Obstacle, Plan: a way of setting a goal that names what gets in the way before it does). Then, as its own short paragraph, ask: "Wish: what do you want to accomplish?"
${chipRule}
Here the suggestions are three different example wishes, such as getting better at drawing, learning a language, or running a first 5k.`;
    case "experience":
      return `They have just told you their Wish. React to it in one short, sincere sentence. Then ask, in these words: "Have you done any of this before? It helps Georgina choose the right starting point, so tasks are never too easy or too hard."
${chipRule}
Here the suggestions are "Complete beginner", then "I ... sometimes" with their activity filled in (for drawing: "I sketch sometimes"), then "I've had lessons or training".`;
    case "outcome":
      return `They have just told you their experience. Acknowledge it in a few words, without judging it. Then ask, in these words: "Outcome: imagine you've got there. What's the best thing about it?" and add, as its own short paragraph: "This is your why. We'll remind you of it when things get hard."
${chipRule}
Here the suggestions are three different outcomes that fit their Wish.`;
    case "obstacle":
      return `They have just told you their Outcome, their why. React to it warmly in one sentence. Then ask, in these words: "Obstacle: what's the main thing inside you that gets in the way? Be honest, nobody's grading this."
${chipRule}
Here the suggestions are three honest, common inner obstacles that fit their Wish, such as scrolling on the phone instead, or being too tired after work.`;
    case "done":
      return `They have just named their Obstacle, and the design is complete. Thank them for being honest in one short sentence. If, and only if, their obstacle involves their phone (scrolling, social apps, videos, games), add this as its own short paragraph: "One idea: set a daily limit for those apps in your phone's Screen Time settings. Totally up to you, Scaffold won't check." Then close with these words as the final paragraph: "Thank you, ${facts.name ?? "builder"}. Your design is ready. I'm handing it to Georgina, your General Contractor, to turn it into a plan."
Do not ask anything further.
${noChips}`;
  }
}

const again: Partial<Record<OnboardingStep, string>> = {
  name: `You couldn't make out a name from their last message. Say so lightly and ask again what you should call them.
${noChips}`,
  nudge_time: `You couldn't work out a time of day from their last message. Say so lightly, as your own limitation and not their mistake, and ask again for a time, such as 8:00 or 19:30.
${noChips}`,
  days: `You couldn't work out a number of days from their last message. Say so lightly, as your own limitation and not their mistake, and ask again for a number from 1 to 7.
${noChips}`,
};

export function aliceDirective(
  step: OnboardingStep,
  variant: Variant,
  facts: Facts,
): { instruction: string; chips: string[] | null } {
  const chips = fixedChips[step] ?? (step === "name" && facts.name ? [facts.name] : null);

  const askAgain = again[step];
  if (variant === "again" && askAgain) {
    return { instruction: askAgain, chips: chips ?? [] };
  }
  if (variant === "follow_up") {
    return {
      instruction: `Their Obstacle answer is honest but too general to plan around. With no hint of criticism, ask one gentle follow-up question that helps them name something more specific: what actually happens in that moment, what they do, feel or tell themselves instead of working on their goal.
${chipRule}
Here the suggestions are three specific examples of what that moment might look like for them.`,
      chips: null,
    };
  }
  if (variant === "aside") {
    return {
      instruction: `Their last message was not an answer to your question. It may be a question for you, or something else on their mind. Respond to it briefly and helpfully. Then come back to the question you were asking and ask it again in fresh words.
${chips ? noChips : `${chipRule}\nOffer three fresh suggestions for that question.`}`,
      chips,
    };
  }
  return { instruction: ask(step, facts), chips: step === "done" ? [] : chips };
}

const marker = "CHIPS:";

// Alice's message without its CHIPS line, and the suggestions from that line.
export function splitChips(full: string): { body: string; chips: string[] } {
  const at = markerIndex(full);
  if (at < 0) return { body: full.trim(), chips: [] };
  const line = full.slice(full[at] === "\n" ? at + 1 : at).split("\n")[0];
  const chips = line
    .slice(marker.length)
    .split("|")
    .map((chip) => chip.trim())
    .filter((chip) => chip.length > 0 && chip.length <= 60)
    .slice(0, 4);
  return { body: full.slice(0, at).trim(), chips };
}

function markerIndex(text: string) {
  if (text.startsWith(marker)) return 0;
  return text.indexOf(`\n${marker}`);
}

// While a message is still arriving: how much of it is safe to show. Holds
// back a last line that is, or might become, the CHIPS line.
export function shownLength(soFar: string) {
  const at = markerIndex(soFar);
  if (at >= 0) return at;
  const lineStart = soFar.lastIndexOf("\n") + 1;
  const lastLine = soFar.slice(lineStart);
  return marker.startsWith(lastLine) ? Math.max(lineStart - 1, 0) : soFar.length;
}
