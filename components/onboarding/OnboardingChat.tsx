"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { TeamBubble, UserBubble } from "@/components/chat/Bubble";
import { StartOver } from "@/components/onboarding/StartOver";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { StepBar } from "@/components/ui/StepBar";
import { TeammateBadge, TeammateLabel } from "@/components/ui/Teammate";
import type {
  ChatEvent,
  ChatMessage,
  OnboardingStep,
} from "@/lib/onboarding/steps";

const placeholders: Record<OnboardingStep, string> = {
  name: "Your name",
  nudge_time: "A time, like 8:00",
  days: "A number from 1 to 7",
  wish: "What you want to accomplish",
  experience: "What you've done before",
  outcome: "The best thing about getting there",
  obstacle: "What gets in the way",
  done: "",
};

type Status = "idle" | "waiting" | "failed";

// Handoff §6.4 and §4.5: the full-height chat with Alice.
export function OnboardingChat({
  initialMessages,
  initialStep,
}: {
  initialMessages: ChatMessage[];
  initialStep: OnboardingStep;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [step, setStep] = useState(initialStep);
  const [arriving, setArriving] = useState("");
  // Alice speaks first, and finishes a reply that failed on an earlier visit.
  const owesReply = (initialMessages.at(-1)?.sender ?? "user") === "user";
  const [status, setStatus] = useState<Status>(owesReply ? "waiting" : "idle");
  const [draft, setDraft] = useState("");
  // What to send again if "Try again" is pressed: the answer itself when it
  // never reached the server, nothing when only Alice's reply failed.
  const unsaved = useRef<string | null>(null);
  const opened = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // Sends an answer (or nothing) and shows Alice's reply as it is written.
  const request = useCallback(async (text: string | null) => {
    let finished = false;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "onboarding", message: text }),
      });
      if (!response.ok || !response.body) throw new Error("Chat request failed");

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line) as ChatEvent;
          if (event.type === "saved") {
            unsaved.current = null;
            setStep(event.step);
            setMessages((list) =>
              list.map((m) => (m.id === "unsaved" ? { ...m, id: `sent-${list.length}` } : m)),
            );
          } else if (event.type === "text") {
            setArriving((soFar) => soFar + event.text);
          } else if (event.type === "message") {
            setArriving("");
            setStep(event.step);
            setMessages((list) => [...list, event.message]);
            finished = true;
          } else if (event.type === "idle") {
            setStep(event.step);
            finished = true;
          }
        }
      }
    } catch {
      finished = false;
    }
    setArriving("");
    setStatus(finished ? "idle" : "failed");
  }, []);

  function send(text: string | null) {
    setStatus("waiting");
    unsaved.current = text;
    if (text) {
      setMessages((list) => [
        ...list.filter((m) => m.id !== "unsaved"),
        { id: "unsaved", sender: "user", body: text, chips: [] },
      ]);
    }
    void request(text);
  }

  useEffect(() => {
    if (opened.current || !owesReply) return;
    opened.current = true;
    void request(null);
  }, [owesReply, request]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, arriving, status]);

  function answer(text: string) {
    const trimmed = text.trim();
    if (!trimmed || status === "waiting") return;
    setDraft("");
    send(trimmed);
    input.current?.focus();
  }

  const last = messages.at(-1);
  const chips = status === "idle" && last && last.sender !== "user" ? last.chips : [];
  const done = step === "done" && status === "idle" && last?.sender !== "user";

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <header className="border-b border-line bg-surface px-4 py-3 desk:px-8">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" aria-label="Scaffold, back to Home">
              <Logo size={30} onNavy={false} />
            </Link>
            <span className="text-caption text-text-muted">Saved as you go</span>
          </div>
          <StepBar step={step} />
        </div>
      </header>

      <main className="bg-grid-paper flex-1 overflow-y-auto px-4 py-5 desk:px-8">
        <div
          role="log"
          aria-live="polite"
          aria-label="Conversation with Alice"
          className="mx-auto flex w-full max-w-[760px] flex-col gap-2.5"
        >
          {messages.map((message, i) =>
            message.sender === "user" ? (
              <UserBubble key={message.id}>{message.body}</UserBubble>
            ) : message.sender === "system" ? null : (
              <div key={message.id} className="flex flex-col gap-1.5">
                {messages[i - 1]?.sender !== message.sender ? (
                  <span className="mt-2 flex items-center gap-2">
                    <TeammateBadge who={message.sender} size={26} />
                    <TeammateLabel who={message.sender} />
                  </span>
                ) : null}
                <TeamBubble>{message.body}</TeamBubble>
              </div>
            ),
          )}

          {status === "waiting" ? (
            <div className="flex flex-col gap-1.5">
              {last?.sender !== "alice" ? (
                <span className="mt-2 flex items-center gap-2">
                  <TeammateBadge who="alice" size={26} />
                  <TeammateLabel who="alice" />
                </span>
              ) : null}
              <TeamBubble>
                {arriving.trim() || (
                  <span className="text-text-muted">Alice is writing…</span>
                )}
              </TeamBubble>
            </div>
          ) : null}

          {status === "failed" ? (
            <div className="flex flex-col items-end gap-1">
              <p className="text-body-sm text-text-secondary">
                That didn&apos;t send. Try again.
              </p>
              <Button variant="secondary" onClick={() => send(unsaved.current)}>
                Try again
              </Button>
            </div>
          ) : null}

          {done ? (
            // PLACEHOLDER. Georgina's message and "See your plan →" (handoff
            // §6.4) arrive with plan generation in checklist slice 3. This
            // wording is not final copy.
            <Card variant="quiet" className="mt-3 flex flex-col gap-3 border border-line">
              <p className="text-body-sm text-text-secondary">
                Placeholder: Georgina drawing up your plan is the next thing
                being built. Your answers are saved for her.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <ButtonLink href="/" variant="secondary">
                  Back to Home
                </ButtonLink>
                <StartOver />
              </div>
            </Card>
          ) : null}
          <div ref={bottom} />
        </div>
      </main>

      {step === "done" ? null : (
        <footer className="border-t border-line bg-surface px-4 py-3 desk:px-8">
          <div className="mx-auto flex w-full max-w-[760px] flex-col gap-2.5">
            {chips.length > 0 ? (
              <ChipRow>
                {chips.map((chip) => (
                  <Chip key={chip} onClick={() => answer(chip)}>
                    {chip}
                  </Chip>
                ))}
              </ChipRow>
            ) : null}
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                answer(draft);
              }}
            >
              <label htmlFor="answer" className="sr-only">
                Your answer
              </label>
              <input
                id="answer"
                ref={input}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholders[step]}
                maxLength={600}
                autoComplete="off"
                className="h-12 min-w-0 flex-1 rounded-input bg-bg px-4 text-body text-ink placeholder:text-text-muted"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={status === "waiting" || !draft.trim()}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-input bg-navy text-surface disabled:opacity-60"
              >
                <Icon name="send" />
              </button>
            </form>
          </div>
        </footer>
      )}
    </div>
  );
}
