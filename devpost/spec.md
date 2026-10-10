---
doc: spec
status: approved
---

# Scaffold — Technical Spec

## How This Works, In Plain Language

Scaffold is a website that works on a phone and on a desktop. It is made of six pieces. Five of them are services run by other companies, each with its own account.

1. **The app (Next.js).** Every screen you designed: Home, Progress, Plan, Talk to Team, Profile, onboarding. It also holds the rules: what counts as a missed task, when confetti fires, who on the team answers. Next.js is a *framework*, a pile of decisions already made for you about how to build a web app.
2. **The host (Vercel).** A rented computer that is always on and runs the app, so other people can open it from a link and it works when your laptop is off.
3. **The database (Supabase).** A set of spreadsheets the app reads and writes: people, goals, plans, tasks, notes, chats. Supabase also does three other jobs: it handles sign-up and log-in, it stores proof photos, and it rings a bell every 15 minutes that tells the app "check whose nudge is due."
4. **The team's brains (Claude).** When Alice asks a question, Georgina writes a plan, or Sarah writes a nudge, the app sends Claude a description of who is speaking and what they know about you, and Claude writes the words. Two models: **Opus 5.5** writes roadmaps and plans (rare, and quality matters most), **Haiku 5.5** handles chat and nudges (frequent, fast, cheap).
5. **WhatsApp (Twilio sandbox).** Sends the daily nudge to your phone and passes your reply back to the app. The sandbox is Twilio's free test setup.
6. **Email (Resend).** Sends the sincere re-engagement email, and stands in for WhatsApp whenever WhatsApp is not allowed to deliver.

**Why this shape.** One service (Supabase) covers four jobs, which keeps the number of accounts down. Next.js with Vercel is the most common pairing for this kind of app, so problems are usually well documented. The app is built so the first working version (build steps 1–8) needs only the first four pieces. WhatsApp and email are added later.

**The one rule that shapes the nudges.** WhatsApp only lets an app write freely to someone who messaged it in the last 24 hours, and a sandbox membership expires after 3 days. So before every nudge the app asks: "Can WhatsApp reach this person right now?" If yes, the nudge goes by WhatsApp. If no, the same message goes by email.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **Sign up.** You type your email, a password and your WhatsApp number. → Supabase creates your account and a row for you in the `profiles` sheet. → You land on Home, which shows the empty lot.
2. **Onboarding with Alice.** You answer a question. → The app saves that answer to your project row straight away, then asks Claude (Haiku) for Alice's next message. → If you close the tab, the saved step is still there, and Home offers "Continue where you left off."
3. **WOOP.** Same loop for Wish, prior experience, Outcome, Obstacle. Alice's instructions tell her to ask a follow-up for a vague obstacle and to suggest Screen Time if the obstacle involves your phone.
4. **Georgina builds the plan.** The app sends your WOOP answers to Claude (Opus) and asks for a fixed shape back: five milestones, 14 daily tasks of 30 minutes or less, sized to you, at least one if–then plan, and a short "why" for each task. → The app checks the shape (five milestones, no task over 30 minutes, each task's minutes equal to its count times its per-item time) and saves it as a draft plan. → You see the plan review screen.
5. **Commit.** You press "I commit to this plan." → The project is marked active, the tasks get calendar dates starting today, and Home switches from the empty lot to today's task.
6. **Daily nudge.** Every 15 minutes Supabase rings the bell. → The app finds everyone whose nudge time just arrived in their own time zone. → For each, it brings their plan up to date (see step 8), asks Claude (Haiku) for Sarah's line, and sends it by WhatsApp or by email.
7. **Mark it done.** In the app, you press "Mark as done" and optionally add a note or photo. On WhatsApp, you reply with words or a photo. → Either way the same piece of code runs: the task is marked done, the note or photo is saved as proof, this week's count goes up, and the app works out whether a celebration is owed.
8. **A missed task rolls forward.** Whenever you open the app or your nudge is due, the app checks for a task dated before today that is not done. → It marks it missed, puts the same task on today, and moves every later task one day.
9. **See progress.** Progress counts your done tasks and draws the house from that number: finished stages in slate, the current stage partly navy, the rest dashed.
10. **Next 2 weeks.** When the planned chunk runs out, the app asks Claude (Opus) for the next 14 tasks toward the current milestone, giving it what you did and missed last time.
11. **Talk to Team.** You send a message. → Claude (Haiku) first picks the teammate whose role fits, then answers as her. → If she proposes a plan change, it is saved as a proposal and shown as a card. Nothing in your plan changes until you press confirm.

## Stack

| Piece | Choice | Why (learner agreed each) |
|---|---|---|
| Language | TypeScript | The language Next.js projects are written in. |
| App framework | **Next.js 16**, App Router | Phone and desktop from one codebase, and the server-side code for AI and WhatsApp lives in the same project. |
| Styling | **Tailwind CSS v4**, with the design handoff's tokens as CSS variables | The handoff says to keep its token names. Tailwind maps to them directly. |
| Hosting | **Vercel**, Hobby (free) plan | Learner chose hosted over local so others can sign up and nudges go out on time. |
| Database, log-in, photos, scheduler | **Supabase**, Free plan | One account for four jobs. |
| AI | **Claude**: `claude-opus-5-5` for plans, `claude-haiku-5-5` for chat and nudges | Learner chose Claude over Gemini and free tiers, and chose Opus over Sonnet for plans. Tradeoff accepted: a few dollars instead of free. |
| WhatsApp | **Twilio WhatsApp Sandbox** | Learner chose the free sandbox only, with no real-sender registration. |
| Email | **Resend**, free plan | The re-engagement email and the WhatsApp backup. |

Key libraries: `@supabase/supabase-js` and `@supabase/ssr`, `@anthropic-ai/sdk`, `twilio`, `resend`, `zod` (checks that the AI's plan has the right shape), `canvas-confetti`.

Documentation:
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs (Auth, Storage, Cron)
- Claude API: https://platform.claude.com/docs
- Twilio WhatsApp: https://www.twilio.com/docs/whatsapp
- Resend: https://resend.com/docs

**Checked on Oct 8–9, 2026:** Claude model IDs and prices, Vercel Hobby cron limits, Supabase Free plan sizes, Resend free allowance, Twilio sandbox rules. Details and links are under **External Services and Dependencies**.

**Not verified. Check early in the build:**
- Exact library versions. Install the latest stable of each at build time.
- That Supabase Cron is available on the Free plan and can call a web address.
- Whether Resend will send to other people's addresses without a domain you own (see **Decisions and Open Issues**).
- How long a Vercel Hobby function may run. Plan generation with Opus can take a minute or more.

## Where It Runs and How Someone Tries It

**Hosted (the real thing).** The app runs on Vercel at a `*.vercel.app` address. Anyone with the link can sign up in a phone or desktop browser. Each push of code to the GitHub repository's `main` branch deploys automatically.

**Local (while building).**
1. Requirements: Node.js 22 or newer, and a `.env.local` file holding the secret keys listed below.
2. Start: `npm install` once, then `npm run dev`.
3. Open: http://localhost:3000

The local app talks to the same Supabase project as the hosted one. WhatsApp replies and the 15-minute bell only reach the hosted app, because Twilio and Supabase need a public address to call.

**Secret keys (`.env.local` locally, Vercel project settings when hosted):**
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `PLAN_MODEL` (optional), `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `TWILIO_SANDBOX_JOIN_CODE`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `APP_URL`.
These never go into the GitHub repository. `.env.example` lists the names with no values.

**For the demo video** (required, along with the public GitHub repository): record on the hosted app. Join the sandbox from your phone, sign up, do the WOOP chat, commit, then press **"Send my nudge now"** in Profile so the WhatsApp message arrives on camera without waiting for the clock. Reply with a photo and show the brick appear. `6-ship` reads this section.

## Look and Feel
Carries forward `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`. The full detail is `SCAFFOLD_DESIGN_HANDOFF.md`, which the build treats as the source of truth for anything visual.

- **Tokens:** the handoff's CSS variables (§2.1) are copied unchanged into `app/globals.css` and exposed to Tailwind under the same names. No color or size is written by hand in a component.
- **Fonts:** Space Grotesk and IBM Plex Sans, loaded through `next/font/google` so they are served with the app.
- **One breakpoint at 700px:** sidebar at 700px and above, top bar plus bottom tabs below it.
- **Red** exists only in the abandon dialog and the ribbon.
- **Motion:** every animation checks `prefers-reduced-motion` and shows its final state instead.
- **Tone:** each teammate's instructions include the handoff's voice table (§9), so AI-written text follows the same "say / never say" rules as the fixed wording.
- **Task size:** 30 minutes or less everywhere, with the length chosen for the person. The handoff's "5–15 minutes" is out of date (`prd.md > Product Decisions`).
- **Portraits:** the four teammate portraits appear on the landing page only. Inside the app, teammates are letter badges.
- **Not designed yet:** log-in (reuses the sign-up layout), Home after today's task is done, Profile before a goal, the **?** popover, and the "Mastery" tag. These use the handoff's existing card, input, button and label styles.

## Components

### App Shell and Navigation
The frame around every screen: sidebar on desktop, top bar and bottom tabs on a phone, with the active item highlighted. Decides between the no-goal and active version of each screen by asking one question: does this person have an active project?
PRD ref: `prd.md > Screens and Layout`.

### Landing Page
The public page a logged-out visitor sees at the main address. It is a plain page with no data behind it. `proxy.ts` serves it at `/` for visitors and sends logged-in people to the app instead. The hero reuses the real house drawing. The four portraits are files in `public/team/`, 800×800 WebP.
PRD ref: `prd.md > Landing Page`.

### Accounts and Profile
Sign-up and log-in with email and password through Supabase Auth, plus the WhatsApp number and the WhatsApp consent tick box, in the split layout from the handoff §6.0b. After sign-up you go straight to onboarding. A `profiles` row is created at sign-up. Profile edits name, weekly target, nudge time and contact details. The time zone is read from the browser at sign-up and saved, so "9:00" means 9:00 where you are. The abandon flow lives here: after the explicit confirmation it deletes the project, everything attached to it, and its photos.
PRD ref: `prd.md > Sign Up and Profile`.

### Team Brains
The single place the app talks to Claude. It holds one set of instructions per teammate (role, voice, what she is allowed to do) and the shared context builder that tells her what she needs to know about you: name, Wish, Outcome, Obstacle, today's task, recent progress. Every other component that needs AI words goes through this one, so swapping the AI later means changing one folder.
PRD ref: `prd.md > Talk to Team`, `prd.md > Product Decisions` (the build team).

### Onboarding Conversation
The chat with Alice: welcome, three profile questions, Wish, prior experience, Outcome, Obstacle. Each answer is saved to the project before Alice's next message is requested. The step bar and the "Continue where you left off" card read the saved `onboarding_step`. Quick-reply chips are suggested by Alice alongside each question.
PRD ref: `prd.md > Onboarding and WOOP Goal Setting`.

### Plan Builder
Georgina. Uses Opus. Three jobs, all returning a fixed shape that the app checks before saving:
1. **First plan:** five milestones, 14 tasks, if–then plans, a "why" for each task.
2. **Next chunk:** 14 more tasks toward the current milestone, given what was done and missed. May mark tasks as mastery.
3. **Path:** breaks a dream into an ordered list of goals.

If the shape is wrong (a task over 30 minutes, a minutes label that does not match the task, not five milestones), it asks once more, then shows a retry button.
PRD ref: `prd.md > Roadmap and 2-Week Chunks`, `prd.md > Mastery Tasks (Refreshers)`, `prd.md > Why This Task`.

**Task length fits the person.** Thirty minutes is a ceiling the code enforces. Inside it, Georgina picks the length from the person's goal, prior experience and what they have said to the team, and her instructions tell her to start short for beginners. There is no separate setting: asking for longer or shorter tasks goes through "Ask for changes" on the plan review or through Talk to Team, and the next 2-week chunk is told what length suited the person.

### Plan Review and Commit
Shows the draft roadmap and first two weeks beside the Wish, Outcome and Obstacle. "Ask for changes" sends the request to Georgina, who returns a revised draft. "I commit to this plan" activates the project and dates the tasks.
PRD ref: `prd.md > Roadmap and 2-Week Chunks`.

### Daily Task and Mark Done
Home's main card and the single `completeTask` routine behind it. `completeTask` is the only code that can mark a task done, whether the tap came from the app or a WhatsApp reply. In order it: marks the task done, saves any proof, updates this week's record, checks for stage complete, house complete and weekly target, and returns which celebrations are owed.
PRD ref: `prd.md > Daily Task and Marking Done`.

### Plan Keeper (roll-forward)
One routine, `bringPlanUpToDate`, run whenever you open the app and just before your nudge. It marks overdue tasks as missed, puts the same task on today, shifts later tasks by one day, and starts next-chunk generation when the planned tasks have run out.
PRD ref: `prd.md > Daily Task and Marking Done` (missed task rolls forward), `prd.md > Roadmap and 2-Week Chunks`.

### House and Progress
The house is one SVG drawing component that takes numbers, not images: which stage you are on and how full it is. Each stage has a fixed number of brick slots, filled by the share of that stage's tasks you have done, so the drawing never changes size (handoff §13 #2, recommended option). Four states: empty lot, in progress, stage complete, finished. Progress also shows the roadmap, weekly target, streak and houses built.
PRD ref: `prd.md > Progress: The House`, `prd.md > Levels and Rewards`.

### Weekly Target, Streak and Celebrations
One `week_records` row per person per week (Monday start). Celebrations are only ever produced by `completeTask`, never by a settings change. A queue shows them one at a time: milestone first, weekly after it is closed. A celebration earned by a WhatsApp reply is stored and shown on the next app visit.
PRD ref: `prd.md > Weekly Target, Streak, and Celebration`.

### Plan View and Learning Log
Tasks by week or by the chosen time frame, with the four statuses told apart by shape as well as shade. The learning log tab lists proof newest first. Notes and photos can be added or edited on any finished task. Editing proof touches only the `proofs` row, never the task's done time or the week record.
PRD ref: `prd.md > Roadmap and 2-Week Chunks` (Plan view), `prd.md > Learning Log`.

### Why This Task
A **?** button beside each task. The explanation is written by Georgina at the same time as the task and stored with it, so opening it is instant and costs nothing. Opens on hover or keyboard focus on desktop and on tap on a phone. Georgina's instructions forbid "proven" and forbid naming a book or study.
PRD ref: `prd.md > Why This Task`.

### Talk to Team
Chat with history kept. Each message goes through two steps with Haiku: pick the teammate (or use the one you picked), then answer as her. A handover adds a "join" notice. A plan change is created as a `plan_proposals` row and drawn as the old-and-new card. Confirm applies it to the tasks. Decline leaves the plan untouched. Before a goal exists this same screen runs the goal-finder.
PRD ref: `prd.md > Talk to Team`.

### Goal Finder, Dreams and Paths
Alice's chat before a goal exists: an interest gets three goal ideas, a big dream brings in Georgina to build a path. "Design this goal with Alice" opens onboarding with the Wish filled in. With a dream, Home and Progress show "House n of m."
PRD ref: `prd.md > Finding a Goal, Dreams, and Paths`.

### Nudge Sender
Runs when Supabase rings the 15-minute bell. For each person whose nudge time has arrived, it runs `bringPlanUpToDate`, works out which message is due from the days since their last done task, has Sarah write it, picks the channel and sends. It records each send in `nudge_log` so nobody gets two in one day.
**Channel rule:** WhatsApp if the person ticked the WhatsApp consent box, messaged the sandbox within the last 24 hours and joined within the last 3 days. Otherwise email.
PRD ref: `prd.md > WhatsApp Nudges and Replies`, `prd.md > Missed Days and Re-engagement`.

| Days since last done task | Message | Channel |
|---|---|---|
| 0–1 | Normal nudge: motivational line plus today's task | WhatsApp, or email if blocked |
| 2 | Gentle about yesterday | WhatsApp, or email if blocked |
| 3 | "Just 5 minutes today?" | WhatsApp, or email if blocked |
| 4 | Sarah invites a chat with the team | WhatsApp, or email if blocked |
| After that | Nothing daily | — |
| Monday of the next week, still nothing done | The sincere email with your Outcome | Email |
| Then | Silence | — |

### WhatsApp Inbox
The address Twilio calls when you reply. It checks the message really came from Twilio, finds you by phone number, and records the time (which reopens the 24-hour window). If the message is the join code, it records the join. Otherwise it treats the text as your note and any picture as your photo, copies the photo into Supabase Storage, runs `completeTask`, and has Sarah reply, including a congratulation if you hit your weekly target.
PRD ref: `prd.md > WhatsApp Nudges and Replies`.

### WhatsApp Connection Notice
A small line on Home when WhatsApp cannot currently reach you, showing the sandbox number and join code, and saying that nudges are arriving by email meanwhile.
PRD ref: none. Added by the learner at review because of the sandbox choice (see **What Was Simplified and Why**).

## Data Model

All of this lives in Supabase's database. Each table is one spreadsheet. A rule on every table ("row-level security") means a logged-in person can only read and change their own rows.

```
profiles        id (= the account), name, email, whatsapp, timezone, nudge_time,
                weekly_target (1–7), houses_built, whatsapp_consent,
                whatsapp_joined_at, whatsapp_last_inbound_at, created_at
dreams          id, user_id, title, experience_level, active
path_steps      id, dream_id, position, title, status (done|current|future), project_id?
projects        id, user_id, path_step_id?, status (onboarding|draft_plan|active|complete),
                wish, experience, outcome, obstacle, if_then_plans (list),
                onboarding_step, planned_through (date), committed_at, completed_at
milestones      id, project_id, position (1–5), stage_name, title, status
tasks           id, project_id, milestone_id, scheduled_date, title, how_to, minutes (≤30),
                why, is_mastery, status (upcoming|done|missed), done_at?, rolled_from_task_id?
proofs          id, task_id, note?, photo_path?, source (app|whatsapp), created_at, updated_at
conversations   id, user_id, project_id? (empty before a goal), kind (onboarding|team|goal_finder)
messages        id, conversation_id, sender (user|alice|georgina|paula|sarah|system),
                body, kind (text|join|proposal), created_at
plan_proposals  id, message_id, status (pending|confirmed|declined), changes (list of task, from, to)
week_records    user_id, week_start (a Monday), target, done_count, hit, celebrated_at?
pending_celebrations  id, user_id, kind (weekly|stage|house), payload, shown_at?
nudge_log       id, user_id, sent_on (date), kind, channel (whatsapp|email)
```

Proof photos are files in a private Supabase Storage folder, one subfolder per person. The `proofs` row stores the path.

**Worked out when needed, never stored:**
- **Today's task:** the task with today's date in your time zone. ("Today" is not a stored status.)
- **Bricks laid:** the count of done tasks in the project.
- **Current stage:** the first milestone that is not done.
- **Streak:** consecutive `week_records` with `hit` true, ending at this week or last.

**How each thing gets updated, and what happens when you leave and come back:**

| Data | Changed by | When you come back |
|---|---|---|
| Onboarding answers | Saved after every answer | Reopens at the saved step |
| Plan and tasks | Plan Builder, a confirmed proposal, or the roll-forward | Brought up to date on open |
| Done tasks and proof | `completeTask`, or editing proof later | Exactly as you left them |
| Week record and streak | `completeTask`, or changing the weekly target (which never celebrates) | Still there |
| Chats | Each message saved as it is sent | Full history kept |
| Settings | Profile | Still there |

**Abandoning a project** deletes the `projects` row. The database is set up so that everything attached to it (milestones, tasks, proofs, conversations, messages, proposals) is deleted with it, and the app removes the photos. `profiles` (including `houses_built`), `week_records` and the dream stay.

**Completing a house** sets the project to `complete`, adds one to `houses_built`, and marks the path step done if there is one.

## File Structure

```
scaffold/
├── app/
│   ├── layout.tsx                # fonts, tokens, the page frame
│   ├── globals.css               # design tokens from the handoff §2
│   ├── (public)/
│   │   └── welcome/page.tsx      # the landing page, shown at "/" to logged-out visitors
│   ├── (auth)/
│   │   ├── sign-up/page.tsx
│   │   └── log-in/page.tsx
│   ├── (app)/                    # everything behind log-in, wrapped in the shell
│   │   ├── layout.tsx            # sidebar / top bar / bottom tabs
│   │   ├── page.tsx              # Home: empty lot, resume, or today's task
│   │   ├── progress/page.tsx
│   │   ├── plan/page.tsx         # Tasks tab
│   │   ├── plan/log/page.tsx     # Learning log tab
│   │   ├── team/page.tsx         # Talk to Team, or goal-finder before a goal
│   │   ├── profile/page.tsx
│   │   └── onboarding/
│   │       ├── page.tsx          # chat with Alice
│   │       └── plan/page.tsx     # plan review and commit
│   └── api/
│       ├── chat/route.ts         # streams a teammate's reply
│       ├── cron/tick/route.ts    # the 15-minute bell lands here
│       └── whatsapp/inbound/route.ts   # Twilio calls this on every reply
├── components/
│   ├── ui/                       # Button, Card, Chip, Dialog, Stepper, icons
│   ├── shell/                    # Sidebar, TopBar, BottomTabs
│   ├── house/                    # House.tsx (the SVG), SmallHouse.tsx
│   ├── chat/                     # bubbles, quick replies, proposal card, join notice
│   ├── task/                     # today's card, mark-done sheet, WhyThisTask (?)
│   └── celebrate/                # confetti, stage stamp, ribbon-cutting, the queue
├── lib/
│   ├── supabase/                 # browser client, server client, admin client
│   ├── ai/
│   │   ├── client.ts             # the one place that calls Claude
│   │   ├── teammates.ts          # Alice, Georgina, Paula, Sarah: role and voice
│   │   ├── context.ts            # what a teammate is told about you
│   │   ├── router.ts             # who should answer this message
│   │   └── plan.ts               # first plan, next chunk, path; shape checks
│   ├── tasks/
│   │   ├── complete.ts           # completeTask: the only way a task becomes done
│   │   ├── keep-up.ts            # bringPlanUpToDate: roll-forward and next chunk
│   │   └── weeks.ts              # week records, target, streak
│   ├── nudges/
│   │   ├── due.ts                # who is due, and which message
│   │   ├── channel.ts            # WhatsApp or email?
│   │   ├── whatsapp.ts           # send through Twilio
│   │   └── email.ts              # send through Resend
│   └── dates.ts                  # time zones, "today", Monday week starts
├── supabase/
│   └── migrations/               # the table definitions and access rules
├── public/team/                  # the four teammate portraits (landing page only)
├── proxy.ts                      # landing page for visitors at "/", log-in for the rest
├── .env.example                  # names of the secret keys, no values
├── SCAFFOLD_DESIGN_HANDOFF.md    # the design handoff, kept under its current name
├── CLAUDE.md                     # tells the coding agent to read the handoff first
├── README.md
├── package.json
└── devpost/                      # Devpost learning workspace
```

The app's files sit in the repository root alongside `devpost/`. Next.js's setup tool refuses a folder that already has files in it, so build step 1 creates the app in a temporary folder and copies it in. The important boundary is `lib/`: screens in `app/` and `components/` never talk to Claude, Twilio or Resend directly. They call `lib/`, and `lib/` does the talking.

## External Services and Dependencies

### Claude (Anthropic)
- **Docs:** https://platform.claude.com/docs · Models: https://platform.claude.com/docs/en/about-claude/models/overview · Prices: https://platform.claude.com/docs/en/about-claude/pricing
- **Call:** `POST https://api.anthropic.com/v1/messages` through `@anthropic-ai/sdk`. Sends `model`, `max_tokens`, `system` (the teammate's instructions and context) and `messages`. Chat replies are streamed. Plans use structured output so the reply comes back in the fixed shape.
- **Models (checked Oct 9, 2026):** `claude-opus-5-5` at $4 in / $20 out per million tokens. `claude-haiku-5-5` at $0.10 in / $0.50 out.
- **Key:** `ANTHROPIC_API_KEY`, used only on the server. Set a monthly spending cap in the Claude Console.
- **Estimated cost:** under $15 for the hackathon. An estimate, not a measurement.
- **Haiku while developing (learner decision, Oct 9, 2026):** the plan-writing model is read from a setting, `PLAN_MODEL`. On the laptop it is set to `claude-haiku-5-5`, so a full test run from onboarding to a finished plan costs well under a cent. On Vercel it is left unset and defaults to `claude-opus-5-5`. Switch the laptop to Opus when judging real plan quality.
- The build should load the `claude-api` skill before writing this code, for current request details.

### Supabase
- **Docs:** https://supabase.com/docs · Pricing: https://supabase.com/pricing
- **Free plan (checked Oct 9, 2026):** 500 MB database, 1 GB file storage, 50,000 monthly users, 2 projects. A project pauses after 1 week with no activity.
- **Auth:** email and password. Email confirmation is switched off (see **What Was Simplified and Why**).
- **Storage:** one private bucket, `proofs`.
- **Cron:** a job every 15 minutes that calls `POST {APP_URL}/api/cron/tick` with the header `Authorization: Bearer {CRON_SECRET}`. Used because Vercel's free plan only allows scheduled jobs once a day, with up to an hour of drift (https://vercel.com/docs/cron-jobs/usage-and-pricing).
- **Keys:** the URL and anon key (safe in the browser) and the service role key (server only, used by the bell and the WhatsApp inbox).

### Twilio WhatsApp Sandbox
- **Docs:** https://www.twilio.com/docs/whatsapp/sandbox
- **Send:** `POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`, signed in with the Account SID and Auth Token. Fields: `From=whatsapp:+14155238886`, `To=whatsapp:{number}`, `Body`.
- **Receive:** Twilio sends a form `POST` to `/api/whatsapp/inbound` with `From`, `Body`, `NumMedia`, `MediaUrl0`, `MediaContentType0`. The app checks the `X-Twilio-Signature` header before trusting it. Downloading the photo needs the same SID and token.
- **Sandbox rules (checked Oct 9, 2026):** each person joins by sending `join <code>` to the shared number. Membership expires after 3 days. Free-form messages only within 24 hours of the person's last message. No custom templates. One message every 3 seconds.
- **Cost:** trial credit, then a fraction of a cent per message.

### Resend
- **Docs:** https://resend.com/docs · Pricing: https://resend.com/pricing
- **Send:** `POST https://api.resend.com/emails` with `Authorization: Bearer {RESEND_API_KEY}` and `{ from, to, subject, html }`.
- **Free plan (checked Oct 9, 2026):** 3,000 emails a month, 100 a day.
- **Unverified:** sending to other people's addresses probably requires a domain you own. See **Decisions and Open Issues**.

### Vercel
- **Docs:** https://vercel.com/docs
- **Plan:** Hobby (free). Deploys from the GitHub repository. Secret keys are entered in the project's settings.

## Important Failure Modes

- **Claude is slow or fails while Georgina builds the plan** → a "Georgina is drawing up your plan" state, then a calm message with a "Try again" button. Your WOOP answers are already saved, so nothing is retyped.
- **The plan comes back the wrong shape** (a task over 30 minutes, not five milestones) → the app asks once more without bothering you. If it fails again, the same "Try again" message.
- **A teammate's chat reply fails** → your message stays in the chat with "That didn't send. Try again."
- **WhatsApp can't reach you** → the nudge goes by email, and Home shows the connection notice with the join code.
- **Nobody has used the app for a week** → Supabase's free plan pauses the project. Fix: press "Restore" in the Supabase dashboard. The 15-minute bell should keep it awake, which is something to confirm during the build.
- **Photo upload fails** → the task is still marked done, with "Your photo didn't save. You can add it later from Plan."

## What Was Simplified and Why

- **Free WhatsApp sandbox** instead of a real WhatsApp sender. Free and certain to work for the demo. The fuller version needs a Meta business account and verification that Twilio says can take several weeks. Cost of the choice: people join with a code word and rejoin every 3 days.
- **Email as the backup channel** instead of every nudge on WhatsApp. The sandbox cannot message someone who has been quiet for 24 hours, which is exactly the missed-day case. Email keeps the no-guilt sequence reaching people, in the same words.
- **No final voice note.** The sequence ends at the sincere email, then silence. The voice note cannot be delivered in the sandbox and would need a sixth service to turn text into speech. It moves to possible later enhancements.
- **Nudge times in 15-minute steps** instead of any minute, because the bell rings every 15 minutes.
- **No "confirm your email" step at sign-up.** Supabase's built-in confirmation emails are tightly limited on the free plan. The fuller version sends them through Resend with a verified domain.
- **The "why" for each task is written with the task,** not when you press **?**. Faster and cheaper, and Georgina explains her own reasoning while she still has it.
- **Roll-forward happens when you open the app or your nudge is due,** not at the stroke of midnight. Same result, no extra scheduled job.
- **"Send my nudge now" button in Profile** so the demo does not wait for the clock. It sends a real nudge through the real path.

Nothing in the kernel (`scope.md > The Unique Kernel`) is faked: the tasks are written by the AI for your goal, the nudge is a real WhatsApp message on a real phone, and the progress comes from tasks you marked done.

## Decisions and Open Issues

### Decided by the learner
- **Hosted, not local,** after confirming hosting itself can be free. Tradeoff: more accounts to set up.
- **Next.js, Vercel, Supabase, Resend:** accepted from the agent's recommendation.
- **Claude for the AI,** after comparing Gemini and the free tiers (Gemini, Mistral, Groq, Cerebras, OpenRouter, Cloudflare). Tradeoff: a few dollars instead of free, in exchange for no daily caps and no user text used for training.
- **Opus 5.5 for plans, Haiku 5.5 for chat and nudges.** The learner raised the plan model from the recommended Sonnet to Opus. Tradeoff: twice the price for plan writing, which happens rarely.
- **Haiku for plans too while developing,** to keep testing costs near zero. Tradeoff: plans seen during everyday testing are not the quality users will get, so plan quality is judged in separate Opus runs.
- **Free WhatsApp sandbox only.** The agent recommended also starting real-sender registration. The learner chose the sandbox alone.
- **Email as the backup** when WhatsApp cannot deliver.
- **No final voice note.** Confirmed at review. The missed-day sequence ends at the sincere email, then silence.
- **A small notice on Home when WhatsApp is disconnected,** with the code word to rejoin. Confirmed at review.

### Derived by the agent from those decisions
Email-and-password log-in · saving the time zone from the browser · the 15-minute bell in Supabase · fixed brick slots per stage · one `completeTask` routine shared by app and WhatsApp · celebrations from WhatsApp shown on the next visit, plus a line in Sarah's reply · chat history kept · missed days stay visible in Plan · "Ask for changes" goes to Georgina · the dream survives abandoning its current house · voice-note timing no longer applies. The last five follow the designer's recommendations in handoff §13.

### The learner's open question, and what answered it
**"What will this cost, and can it be free?"** raised three times: for hosting, for Gemini, and for free tiers generally. Answered by looking up current prices together rather than guessing. Hosting, database and email fit free plans. The AI and WhatsApp cost cents per use. The estimate is $5–20 for the hackathon, mostly AI use while testing. To check during the build: set a spending cap in the Claude Console on day one, and look at actual spend after the first full onboarding-to-plan run.

### Still open
- **Resend and other people's email addresses.** If Resend needs a domain you own, the email backup and the sincere email will only reach your own address until you buy and connect one (about $10 a year). Check when the email step is built. If it is a blocker, friends would get WhatsApp-only nudges.
- **Supabase Cron on the Free plan,** and whether it keeps the project from pausing.
- **Vercel Hobby time limit** against a slow Opus plan. If it is too short, the plan is generated in two smaller requests.
- **House stage brick-slot counts** (how many slots each stage has). Set when the house is drawn.
- **Carried from `prd.md > Open Questions`:** "Start over" confirmation in onboarding, a ground-breaking moment after commit, and the screens and wording not designed yet (Home after done, Profile before a goal, sign-up and log-in, WhatsApp and email copy). None blocks the build. Each is decided at its build step.
