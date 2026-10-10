# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Scaffold: a web app whose AI "build team" (Alice the Architect, Georgina the General Contractor, Paula the Project Manager, Sarah the Site Lead) turns a goal into one small daily task, nudges the user on WhatsApp, and draws progress as a house going up brick by brick. Built for the Devpost "Build With AI: Basics" hackathon. Submission deadline: Oct 26, 2026.

**Current state: building.** `devpost/checklist.md` is the progress record: the first unchecked slice is where the build is up to. Slice 1 created the app (shell, sign-up and log-in, empty states). The architecture below describes the finished plan, so check what actually exists before relying on a piece of it.

## Source-of-truth documents

Read these before building. Where they disagree, the later one in this list wins on its own subject.

| File | Says |
|---|---|
| `devpost/scope.md` | The original small idea and its kernel. Superseded in size by the PRD. |
| `devpost/prd.md` | What the product does. Its **Features and Behavior** headings are what code must implement and cite. |
| `SCAFFOLD_DESIGN_HANDOFF.md` | How it looks and responds: tokens, components, every screen, final copy, behavior rules (§7). |
| `devpost/spec.md` | How it is built: stack, components, data model, file structure, service contracts. |
| `devpost/checklist.md` | The ordered build steps and progress state. `5-build` resumes at the first unchecked slice. |

Before building or changing any UI, read `SCAFFOLD_DESIGN_HANDOFF.md`. Follow its tokens, components and rules exactly. If something is not covered, ask instead of inventing.

Known disagreements, already decided:
- Tasks are **30 minutes or less**, and the length is chosen for the person (goal, experience, conversations with the team). 30 is a ceiling, not a target. The handoff's "5–15 minutes" is out of date, including in the version of Oct 10, 2026 (§6.0b, §7.1). Its task-length check is adopted with the 30-minute limit: total time is count × minutes, and the "About n minutes" label must equal that total.
- Addresses are `/sign-up` and `/log-in` (spec). The handoff's `/signup` and `/login` redirect to them.
- WhatsApp consent is optional at sign-up. No consent means no WhatsApp messages, never a blocked sign-up.
- After sign-up a new user lands on the empty-lot Home, not in the onboarding chat (the handoff §6.0b says otherwise).
- Teammate portraits are for the landing page only. Inside the app, teammates are letter badges.
- There is **no final voice note**. The missed-day sequence ends at the sincere email.
- The handoff asks to be renamed `DESIGN.md`. It has not been; the PRD and spec cite it by its current name.

The `*.html` files in `devpost/` are review companions generated from the markdown. The markdown is canonical; regenerate the HTML after changing it.

## How work proceeds here

The project follows the Devpost skills in `.agents/skills/` (symlinked into `.claude/skills/`; `agent/skills/` is a second copy): `4-spec` → `5-build` → `6-ship`. Each skill routes on the `status:` line in the frontmatter of the `devpost/*.md` files, never on conversation memory. `5-build` will not start until scope, PRD and spec are all `status: approved`.

The owner has no prior coding experience and is learning to act as the product manager. Product decisions are theirs: explain in plain language, recommend with the tradeoff, and get agreement before making a consequential choice. Do not expand scope on your own.

The owner plans to adopt the cc-rpi blueprint (github.com/juan294/cc-rpi) after the hackathon build ships. Do not install it or apply its workflow before then.

`devpost/learner-profile.md` is gitignored on purpose. The GitHub repository is public; never stage it.

## Commands

```
npm install        # once
npm run dev        # http://localhost:3000
npm run build      # production build and type check; every slice must pass it
npm run lint       # eslint
node --env-file=.env.local scripts/check-accounts.mjs   # sign-up, profile row and access rules, against the real Supabase project
node --env-file=.env.local scripts/check-pages.mjs      # every page logged out and logged in; needs `npm run dev` running
```

Requires Node.js 22+ and a `.env.local` with the keys named in `.env.example`. There is no test runner. Each slice is verified by `npm run build` plus a small script in `scripts/` that runs against the real Supabase project and cleans up after itself.

Database changes are SQL files in `supabase/migrations/`, numbered in order. The Supabase CLI is not installed: the owner runs each new file in the Supabase dashboard's SQL Editor.

## Next.js 16 specifics

Read `AGENTS.md` and the guides in `node_modules/next/dist/docs/` before writing Next.js code. This version differs from older ones.

- `cacheComponents` is on. Anything that reads the session (cookies) must render inside a `<Suspense>` boundary. `app/(app)/layout.tsx` already wraps every page in one, so pages can be `async` and call `getProfile()` from `lib/profile.ts`.
- Middleware is called `proxy.ts`. It refreshes the Supabase session, serves the landing page (`app/(public)/welcome`) at `/` for logged-out visitors, and redirects them to log-in from anywhere else. `/api/*` is excluded on purpose: those routes check their own secrets.

## Styling

- Tokens live in `app/globals.css` inside `@theme`, with the handoff's names (`bg-navy`, `text-text-muted`, `border-line`). Tailwind's default palette and breakpoints are switched off, so `bg-white` or `md:` do not exist. Use `bg-surface` and the single `desk:` breakpoint (700px).
- Type sizes are utilities named after the handoff's type tokens: `text-h1`, `text-h2`, `text-h3`, `text-task-title`, `text-body`, `text-body-sm`, `text-caption`, `text-label`.
- Shared pieces are in `components/ui/` (Button, ButtonLink, Card, Chip, Tag, Icon, TeammateBadge, Field, EmptyState).

## Architecture (planned; partly built)

Next.js 16 (App Router, TypeScript, Tailwind v4) hosted on Vercel's free plan, with Supabase (database, auth, photo storage, cron), Claude (`claude-opus-5-5` for plans, `claude-haiku-5-5` for chat and nudges), the Twilio WhatsApp Sandbox, and Resend for email.

Things that take reading several sections of the spec to see:

- **`lib/` is the only layer that talks to outside services.** Screens in `app/` and `components/` never call Claude, Twilio or Resend directly.
- **`completeTask` is the only way a task becomes done,** whether the tap came from the app or a WhatsApp reply. It also updates the week record and decides which celebrations are owed. Celebrations are never triggered by anything else, including settings changes.
- **`bringPlanUpToDate` runs lazily** on app open and before each nudge. It rolls missed tasks forward and starts next-chunk generation. There is no midnight job.
- **Scheduling comes from Supabase Cron, not Vercel.** Vercel's free plan allows cron once a day only, so Supabase calls `/api/cron/tick` every 15 minutes.
- **Every nudge chooses its channel.** WhatsApp only if the user messaged the sandbox within 24 hours and joined within 3 days; otherwise the same message goes by email. This is a WhatsApp platform rule, not a preference, and it is why inbound-message time is stored on the profile.
- **Derived values are never stored:** today's task, bricks laid, current stage, streak.
- **Abandoning a project is a hard delete** that cascades to everything under the project. The profile, `houses_built`, week records and the dream survive.
- **AI plan output is validated** (five milestones, no task over 30 minutes, minutes label equal to count × per-item time) before it is saved, with one silent retry.

## Design rules that are easy to break

- Red appears in exactly two places: the abandon confirmation and the house-complete ribbon. Never for missed tasks or errors.
- A missed task is never blamed. Use the handoff's wording (§9).
- One breakpoint at 700px: sidebar at and above, top bar plus bottom tabs below.
- Every animation honors `prefers-reduced-motion`.
- A teammate may propose a plan change, but nothing changes until the user confirms.
