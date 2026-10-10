import "server-only";
import { streamReply, type Turn } from "@/lib/ai/client";
import { builderContext } from "@/lib/ai/context";
import { teammateInstructions } from "@/lib/ai/teammates";
import { createAdminClient } from "@/lib/supabase/admin";
import { readAnswer, readDays, readName, readTime } from "./interpret";
import { aliceDirective, shownLength, splitChips, type Variant } from "./script";
import {
  nextStep,
  onboardingSteps,
  type ChatEvent,
  type ChatMessage,
  type OnboardingStep,
} from "./steps";

// The onboarding conversation with Alice (spec.md > Components > Onboarding
// Conversation). Every answer is saved before Alice's next message is asked
// for, so leaving at any point loses nothing.
//
// The database only lets the server write these tables, so everything here
// uses the admin client and filters by the person's id itself.

type Project = {
  id: string;
  onboarding_step: OnboardingStep;
  wish: string | null;
  experience: string | null;
  outcome: string | null;
  obstacle: string | null;
};

export type Onboarding = {
  project: Project;
  conversationId: string;
  messages: ChatMessage[];
};

const projectColumns = "id, onboarding_step, wish, experience, outcome, obstacle";

// The goal this person is in the middle of designing, if there is one.
export async function getOnboarding(userId: string): Promise<Onboarding | null> {
  const db = createAdminClient();
  const { data: project } = await db
    .from("projects")
    .select(projectColumns)
    .eq("user_id", userId)
    .eq("status", "onboarding")
    .maybeSingle();
  if (!project) return null;

  const { data: conversation } = await db
    .from("conversations")
    .select("id")
    .eq("project_id", project.id)
    .eq("kind", "onboarding")
    .maybeSingle();
  if (!conversation) return null;

  const { data: messages } = await db
    .from("messages")
    .select("id, sender, body, chips")
    .eq("conversation_id", conversation.id)
    .order("created_at");
  return {
    project: project as Project,
    conversationId: conversation.id,
    messages: (messages ?? []) as ChatMessage[],
  };
}

async function startOnboarding(userId: string): Promise<Onboarding | null> {
  const db = createAdminClient();
  const { data: project } = await db
    .from("projects")
    .insert({ user_id: userId })
    .select(projectColumns)
    .single();
  if (!project) return null;
  const { data: conversation } = await db
    .from("conversations")
    .insert({ user_id: userId, project_id: project.id, kind: "onboarding" })
    .select("id")
    .single();
  if (!conversation) return null;
  return { project: project as Project, conversationId: conversation.id, messages: [] };
}

// "Start over": clears the unfinished design and its chat. The name, nudge
// time and days a week stay on the profile until Alice asks again.
export async function clearOnboarding(userId: string) {
  const db = createAdminClient();
  await db.from("projects").delete().eq("user_id", userId).eq("status", "onboarding");
}

// Saves one answer and says what Alice should do next.
async function saveAnswer(
  userId: string,
  onboarding: Onboarding,
  text: string,
): Promise<Variant> {
  const db = createAdminClient();
  const { project } = onboarding;
  const step = project.onboarding_step;
  const lastTeamMessage = onboarding.messages.findLast((m) => m.sender !== "user");
  const tappedChip = lastTeamMessage?.chips.includes(text) ?? false;

  const profile: Record<string, string | number> = {};
  const answers: Partial<Project> = {};
  let variant: Variant = "ask";

  if (step === "name") {
    const name = readName(text);
    if (name) profile.name = name;
    else variant = "again";
  } else if (step === "nudge_time") {
    const time = readTime(text);
    if (time) profile.nudge_time = time;
    else variant = "again";
  } else if (step === "days") {
    const days = readDays(text);
    if (days) profile.weekly_target = days;
    else variant = "again";
  } else if (step === "obstacle") {
    const reading = await readAnswer(step, text);
    if (!reading.answered) {
      variant = "aside";
    } else {
      answers.obstacle = text;
      // One follow-up at most: a second general answer is accepted as it is.
      if (!reading.specific && !project.obstacle) variant = "follow_up";
    }
  } else if (step !== "done") {
    // A tapped suggestion is always an answer, so it isn't checked.
    const reading = tappedChip ? { answered: true } : await readAnswer(step, text);
    if (reading.answered) answers[step] = text;
    else variant = "aside";
  }

  if (variant === "ask") answers.onboarding_step = nextStep(step);

  if (Object.keys(profile).length > 0) {
    const { error } = await db.from("profiles").update(profile).eq("id", userId);
    if (error) throw error;
  }
  if (Object.keys(answers).length > 0) {
    const { error } = await db.from("projects").update(answers).eq("id", project.id);
    if (error) throw error;
    Object.assign(project, answers);
  }
  return variant;
}

async function addMessage(
  onboarding: Onboarding,
  message: Omit<ChatMessage, "id">,
): Promise<ChatMessage> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("messages")
    .insert({ conversation_id: onboarding.conversationId, ...message })
    .select("id, sender, body, chips")
    .single();
  if (error || !data) throw error ?? new Error("Message not saved");
  onboarding.messages.push(data as ChatMessage);
  return data as ChatMessage;
}

function toTurns(messages: ChatMessage[]): Turn[] {
  const turns: Turn[] = [
    { role: "user", content: "[The builder has opened the chat.]" },
  ];
  for (const message of messages) {
    if (message.sender === "system") continue;
    if (message.sender === "user") {
      turns.push({ role: "user", content: message.body });
    } else {
      const chips = message.chips.length ? `\nCHIPS: ${message.chips.join(" | ")}` : "";
      turns.push({ role: "assistant", content: message.body + chips });
    }
  }
  return turns;
}

// One turn of the chat. With text: save the answer, then Alice replies.
// Without: Alice says whatever she owes (her opening, or a reply that failed
// last time), or nothing if the builder is the one who speaks next.
export async function onboardingTurn(
  userId: string,
  text: string | null,
  emit: (event: ChatEvent) => void,
) {
  const onboarding = (await getOnboarding(userId)) ?? (await startOnboarding(userId));
  if (!onboarding) throw new Error("Could not open onboarding");
  const { project } = onboarding;

  let variant: Variant = "ask";
  if (text && project.onboarding_step !== "done") {
    await addMessage(onboarding, { sender: "user", body: text, chips: [] });
    variant = await saveAnswer(userId, onboarding, text);
    emit({ type: "saved", step: project.onboarding_step });
  } else {
    const last = onboarding.messages.at(-1);
    if (last && last.sender !== "user") {
      emit({ type: "idle", step: project.onboarding_step });
      return;
    }
    // Picking up after a failed reply: the obstacle follow-up is still owed.
    if (last && project.onboarding_step === "obstacle" && project.obstacle) {
      variant = "follow_up";
    }
  }

  const db = createAdminClient();
  const { data: profile } = await db
    .from("profiles")
    .select("name, nudge_time, weekly_target, whatsapp_consent")
    .eq("id", userId)
    .single();
  if (!profile) throw new Error("Profile not found");

  const step = project.onboarding_step;
  const directive = aliceDirective(step, variant, {
    name: profile.name,
    whatsappConsent: profile.whatsapp_consent,
  });
  // Before the "You" questions are answered, the profile holds defaults,
  // not choices, so Alice isn't told them.
  const answered = (s: OnboardingStep) => onboardingSteps.indexOf(step) > onboardingSteps.indexOf(s);
  const system = [
    teammateInstructions("alice"),
    builderContext({
      name: answered("name") ? profile.name : null,
      nudge_time: answered("nudge_time") ? profile.nudge_time : null,
      weekly_target: answered("days") ? profile.weekly_target : null,
      wish: project.wish,
      experience: project.experience,
      outcome: project.outcome,
      obstacle: project.obstacle,
    }),
    `You are in the onboarding chat, asking one question at a time. What to say now:\n${directive.instruction}`,
  ].join("\n\n");

  let soFar = "";
  let shown = 0;
  const full = await streamReply({
    system,
    turns: toTurns(onboarding.messages),
    onText(piece) {
      soFar += piece;
      const upTo = shownLength(soFar);
      if (upTo > shown) {
        emit({ type: "text", text: soFar.slice(shown, upTo) });
        shown = upTo;
      }
    },
  });

  const reply = splitChips(full);
  const message = await addMessage(onboarding, {
    sender: "alice",
    body: reply.body,
    chips: directive.chips ?? reply.chips,
  });
  emit({ type: "message", message, step });
}
