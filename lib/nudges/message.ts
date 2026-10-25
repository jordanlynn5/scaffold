import "server-only";
import { z } from "zod";
import { readFacts } from "@/lib/ai/client";
import { builderContext } from "@/lib/ai/context";
import { teammateInstructions } from "@/lib/ai/teammates";

// What Sarah's daily nudge says (handoff §13 #14: copy not designed, so this
// is the agreed draft). Sarah writes only the motivational line. The task
// itself is copied from the plan word for word, so the numbers can't drift.

export type NudgeTask = {
  title: string;
  how_to: string;
  minutes: number;
  count: number;
  minutes_per_item: number;
  status: string;
};

export type NudgePerson = {
  name: string | null;
  wish: string | null;
  outcome: string | null;
  obstacle: string | null;
};

const FALLBACK_LINE = "One small task today. Small steps still count.";

async function sarahsLine(person: NudgePerson, task: NudgeTask) {
  const reply = await readFacts({
    system: `${teammateInstructions("sarah")}

${builderContext(person)}

Write the opening line of today's message to the builder: one or two short sentences of encouragement that fit their goal and today's task. Greet them by name if you know it. Do not restate the task's steps or minutes, which follow your line. ${task.status === "done" ? "They have already done today's task, so thank them for it instead of urging them on." : ""} No emoji, no quotation marks.`,
    text: `Today's task: ${task.title}`,
    shape: z.object({ line: z.string() }),
  });
  const line = reply?.line.trim();
  return line && line.length <= 280 ? line : FALLBACK_LINE;
}

function appUrl() {
  return (process.env.APP_URL ?? "").replace(/\/$/, "");
}

function taskSize(task: NudgeTask) {
  return `About ${task.minutes} minutes (${task.count} × ${task.minutes_per_item} min)`;
}

export async function writeNudge(person: NudgePerson, task: NudgeTask) {
  const line = await sarahsLine(person, task);
  const link = appUrl();

  // WhatsApp shows *text* in bold.
  const whatsapp = [
    line,
    "",
    `*Today's task:* ${task.title}`,
    taskSize(task),
    task.how_to,
    "",
    `When you're done, mark it in Scaffold: ${link}`,
    "— Sarah, your Site Lead",
  ].join("\n");

  const subject = `Today's task: ${task.title}`;
  const text = [
    line, "", `Today's task: ${task.title}`, taskSize(task), task.how_to, "",
    `When you're done, mark it in Scaffold: ${link}`, "", "Sarah, your Site Lead",
  ].join("\n");

  return { line, whatsapp, subject, text, link };
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// The same message as an email, in the app's colours (handoff §2).
// `reconnect` explains why it came by email and how to get WhatsApp back.
export function nudgeEmailHtml(
  message: Awaited<ReturnType<typeof writeNudge>>,
  task: NudgeTask,
  reconnect: string | null,
) {
  return `<!doctype html><html><body style="margin:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#14202e">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <p style="margin:0 0 16px;font-size:14px;font-weight:bold;color:#1f3a5f">Scaffold</p>
  <div style="background:#ffffff;border:1px solid #d5dde7;border-radius:14px;padding:24px">
    <p style="margin:0 0 20px;font-size:16px;line-height:1.5">${escape(message.line)}</p>
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;color:#4a5a6e">TODAY'S TASK</p>
    <p style="margin:0 0 6px;font-size:20px;font-weight:bold;line-height:1.3">${escape(task.title)}</p>
    <p style="margin:0 0 12px;font-size:14px;color:#4a5a6e">${escape(taskSize(task))}</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#3a4a5e">${escape(task.how_to)}</p>
    <a href="${escape(message.link)}" style="display:inline-block;background:#1f3a5f;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 20px;border-radius:10px">Open Scaffold</a>
    <p style="margin:24px 0 0;font-size:14px;color:#3a4a5e">Sarah, your Site Lead</p>
  </div>
  ${reconnect ? `<p style="margin:16px 4px 0;font-size:13px;line-height:1.5;color:#4a5a6e">${escape(reconnect)}</p>` : ""}
</div></body></html>`;
}
