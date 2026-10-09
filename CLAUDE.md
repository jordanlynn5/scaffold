# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Scaffold: a web app whose AI "build team" (Alice the Architect, Georgina the General Contractor, Paula the Project Manager, Sarah the Site Lead) turns a goal into one small daily task, nudges the user on WhatsApp, and draws progress as a house going up brick by brick. Built for the Devpost "Build With AI: Basics" hackathon. Submission deadline: Oct 26, 2026.

**Current state: planning only. No application code exists yet.** The commands and structure below are what `devpost/spec.md` plans. Check what actually exists before relying on them, and update this file once build step 1 creates the app.

## Source-of-truth documents

Read these before building. Where they disagree, the later one in this list wins on its own subject.

| File | Says |
|---|---|
| `devpost/scope.md` | The original small idea and its kernel. Superseded in size by the PRD. |
| `devpost/prd.md` | What the product does. Its **Features and Behavior** headings are what code must implement and cite. |
| `SCAFFOLD_DESIGN_HANDOFF.md` | How it looks and responds: tokens, components, every screen, final copy, behavior rules (§7). |
| `devpost/spec.md` | How it is built: stack, components, data model, file structure, service contracts. |
| `devpost/checklist.md` | The ordered build steps (created by `5-build`; not present yet). |

Before building or changing any UI, read `SCAFFOLD_DESIGN_HANDOFF.md`. Follow its tokens, components and rules exactly. If something is not covered, ask instead of inventing.

Known disagreements, already decided:
- Tasks are **20 minutes or less**. The handoff's "5–15 minutes" is out of date.
- There is **no final voice note**. The missed-day sequence ends at the sincere email.
- The handoff asks to be renamed `DESIGN.md`. It has not been; the PRD and spec cite it by its current name.

The `*.html` files in `devpost/` are review companions generated from the markdown. The markdown is canonical; regenerate the HTML after changing it.

## How work proceeds here

The project follows the Devpost skills in `.agents/skills/` (symlinked into `.claude/skills/`; `agent/skills/` is a second copy): `4-spec` → `5-build` → `6-ship`. Each skill routes on the `status:` line in the frontmatter of the `devpost/*.md` files, never on conversation memory. `5-build` will not start until scope, PRD and spec are all `status: approved`.

The owner has no prior coding experience and is learning to act as the product manager. Product decisions are theirs: explain in plain language, recommend with the tradeoff, and get agreement before making a consequential choice. Do not expand scope on your own.

The owner plans to adopt the cc-rpi blueprint (github.com/juan294/cc-rpi) after the hackathon build ships. Do not install it or apply its workflow before then.

`devpost/learner-profile.md` is gitignored on purpose. The GitHub repository is public; never stage it.

## Planned commands

From `devpost/spec.md > Where It Runs and How Someone Tries It`. None work until the app is scaffolded.

```
npm install        # once
npm run dev        # http://localhost:3000
```

Requires Node.js 22+ and a `.env.local` with the keys named in the spec. No test runner or linter has been chosen yet.

`create-next-app` refuses a non-empty directory, and this repository is already non-empty. Scaffold in a temporary folder and copy the result in.

## Planned architecture

Next.js 16 (App Router, TypeScript, Tailwind v4) hosted on Vercel's free plan, with Supabase (database, auth, photo storage, cron), Claude (`claude-opus-5-5` for plans, `claude-haiku-5-5` for chat and nudges), the Twilio WhatsApp Sandbox, and Resend for email.

Things that take reading several sections of the spec to see:

- **`lib/` is the only layer that talks to outside services.** Screens in `app/` and `components/` never call Claude, Twilio or Resend directly.
- **`completeTask` is the only way a task becomes done,** whether the tap came from the app or a WhatsApp reply. It also updates the week record and decides which celebrations are owed. Celebrations are never triggered by anything else, including settings changes.
- **`bringPlanUpToDate` runs lazily** on app open and before each nudge. It rolls missed tasks forward and starts next-chunk generation. There is no midnight job.
- **Scheduling comes from Supabase Cron, not Vercel.** Vercel's free plan allows cron once a day only, so Supabase calls `/api/cron/tick` every 15 minutes.
- **Every nudge chooses its channel.** WhatsApp only if the user messaged the sandbox within 24 hours and joined within 3 days; otherwise the same message goes by email. This is a WhatsApp platform rule, not a preference, and it is why inbound-message time is stored on the profile.
- **Derived values are never stored:** today's task, bricks laid, current stage, streak.
- **Abandoning a project is a hard delete** that cascades to everything under the project. The profile, `houses_built`, week records and the dream survive.
- **AI plan output is validated** (five milestones, no task over 20 minutes) before it is saved, with one silent retry.

## Design rules that are easy to break

- Red appears in exactly two places: the abandon confirmation and the house-complete ribbon. Never for missed tasks or errors.
- A missed task is never blamed. Use the handoff's wording (§9).
- One breakpoint at 700px: sidebar at and above, top bar plus bottom tabs below.
- Every animation honors `prefers-reduced-motion`.
- A teammate may propose a plan change, but nothing changes until the user confirms.
