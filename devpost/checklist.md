---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

**Submission boundary (Oct 26, 2026):** the learner explicitly stopped
feature work after slice 6 to prepare the hackathon submission. Slices 7–14
below are deferred, not completed. Finish the existing review and shipping
work for the working six-slice proof of concept; do not start slice 7.

**Resume handoff:** `devpost/resume.md` records the October 25 shutdown and
October 26 continuation. Slice 6's manual WhatsApp receipt, matching Home line,
revised "Hi" greeting and automatic email receipt are learner-confirmed.
Outgoing WhatsApp/email, the hourly scheduler
and real incoming-message routing now pass. Safari use is approved. The
learner completed the newer Console's terms step and rejoin/hello test;
Scaffold recorded the actual inbound at 18:50:30 UTC. The live automated
nudge checks passed again on October 26.

## Slices

- [x] **1. You can sign up, log in, and land on the empty lot, on a live link**
  Becomes usable: A real website at a `*.vercel.app` address in the Blueprint look. A visitor sees the landing page and can create an account, log out and back in, and move between Home, Progress, Plan, Talk to Team and Profile. Each shows its "before a goal" state pointing to Alice.
  Why now: Everything else lands on this. Putting it on the live link now, instead of at the end, means any hosting or account problem shows up on day one while it is cheap to fix.
  PRD ref: `prd.md > Landing Page`, `prd.md > Sign Up and Profile`, `prd.md > Screens and Layout`, `prd.md > States and Boundaries` (first use), `prd.md > Look and Feel`
  Spec ref: `spec.md > Components > Landing Page`, `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`, `spec.md > Components > App Shell and Navigation`, `spec.md > Components > Accounts and Profile`, `spec.md > Data Model` (`profiles`), `spec.md > File Structure`
  Build: Scaffold Next.js 16 in a temporary folder and copy it in. Copy the handoff's tokens (§2) into `app/globals.css`, load the two fonts, build the shared pieces (Button, Card, Chip, icons) and the shell (sidebar at 700px and above, top bar plus bottom tabs below). Create the Supabase project with the learner, add the `profiles` table and its access rule as a migration, the landing page (handoff §6.0) with the four portraits, sign-up in the handoff's split layout (§6.0b: email, WhatsApp number, password, consent tick box, time zone from the browser) and log-in, and `proxy.ts` to show visitors the landing page and keep the app behind log-in. Build the empty-lot Home (handoff §6.1) and the empty states for Progress, Plan, Team and Profile (§6.2, §6.3 static, §7.7). Add `.env.example` and a README. Connect the GitHub repository to Vercel and deploy.
  Verify (mechanical): `npm run build` finishes with no errors. A script signs up a throwaway account against Supabase, confirms its `profiles` row exists with a time zone, confirms a second account cannot read it, then deletes it (`scripts/check-accounts.mjs`). Logged out, `/` shows the landing page and every app page redirects to log-in; logged in, every page renders (`scripts/check-pages.mjs`). The Vercel address returns the landing page.
  Learner check: Open the Vercel link on your phone and on your laptop. Read the landing page as a stranger would. Sign up, look at all five menus, log out, log back in. Say whether it looks like your Blueprint design and whether anything feels off.
  Commit: `Add app shell, sign-up and the empty lot`

- [x] **2. You can do the onboarding and WOOP chat with Alice, and pick up where you left off**
  Becomes usable: "Design my goal with Alice" opens a real chat. Alice welcomes you, asks your name, nudge time and days per week, then Wish, prior experience, Outcome and Obstacle, with quick replies and the step bar. Close the tab mid-way and Home offers "Continue where you left off."
  Why now: This is the first time the app talks to Claude, so it is where we find out whether the AI setup works as the spec assumes. Everything Georgina writes later depends on these saved answers.
  PRD ref: `prd.md > Onboarding and WOOP Goal Setting`, `prd.md > The Core Journey` (steps 2–3)
  Spec ref: `spec.md > Components > Team Brains`, `spec.md > Components > Onboarding Conversation`, `spec.md > External Services and Dependencies > Claude (Anthropic)`, `spec.md > Data Model` (`projects`, `conversations`, `messages`), `spec.md > Important Failure Modes` (chat reply fails)
  Build: Load the `claude-api` skill first and confirm both model IDs in the spec answer a one-line request. Add `lib/ai/` (client, teammates with the handoff §9 voice table, context), the `/api/chat` streaming route, the `projects`, `conversations` and `messages` tables, and the onboarding screen (handoff §6.4, chat pieces §4.5, stepper). Save each answer before asking for Alice's next message. Alice's instructions cover the vague-obstacle follow-up and the Screen Time suggestion. Add the resume card on Home and the light "Start over" confirmation. Set a spending cap in the Claude Console with the learner.
  Verify (mechanical): `npm run build` passes. A script walks a test account through every onboarding step, checks the project row holds each answer and the right `onboarding_step` after each, checks that "life gets busy" produces a follow-up question rather than moving on, and checks that reloading mid-way returns the saved step.
  Learner check: Do the chat as yourself with your illustration goal. Stop after the Wish, close the tab, come back and continue. Give a vague obstacle once and see what Alice does. Say whether she sounds like the Alice you designed.
  Commit: `Add onboarding and WOOP chat with Alice`

- [x] **3. Georgina builds your plan, and you commit to it**
  Becomes usable: After the Obstacle, Georgina draws up five milestones and 14 daily tasks of 30 minutes or less, sized to you, with an if–then plan. You can ask for changes, then press "I commit to this plan," and Home switches from the empty lot to today's task.
  Why now: This is the first half of the kernel: a goal turned into one small, clear task a day. It also carries the biggest technical unknown, a slow AI request on the free hosting plan, so it is tested on the live link here rather than discovered later.
  PRD ref: `prd.md > Roadmap and 2-Week Chunks`, `prd.md > Why This Task` (the explanation is written with the task), `prd.md > The Core Journey` (steps 4–5)
  Spec ref: `spec.md > Components > Plan Builder`, `spec.md > Components > Plan Review and Commit`, `spec.md > Data Model` (`milestones`, `tasks`), `spec.md > Important Failure Modes` (slow plan, wrong shape), `spec.md > Decisions and Open Issues > Still open` (Vercel time limit)
  Build: Add `lib/ai/plan.ts` with the fixed plan shape and its checks (five milestones, no task over 30 minutes, each task's minutes equal to its count times its per-item time, at least one if–then, a "why" per task). Georgina's instructions size tasks to the person's goal, experience and conversations, starting short for beginners, one silent retry, then the calm "Try again" state. Model comes from `PLAN_MODEL`. Add the `milestones` and `tasks` tables, the plan review screen (handoff §6.5), "Ask for changes" to Georgina, and commit (project active, tasks dated from today in the person's time zone). Add `lib/dates.ts`. Home shows the goal and today's task card, read-only for now. If the hosted request times out, split plan generation into two smaller requests and record it under Revisions.
  Verify (mechanical): `npm run build` passes. A script generates a plan from fixed WOOP answers and asserts five milestones, 14 tasks, every task 30 minutes or less with a non-empty "why," and at least one if–then. It feeds the checker a deliberately bad plan (a 40-minute task, a task labeled 10 minutes that adds up to 30, four milestones) and confirms each is rejected. Plans generated for a complete beginner and for someone experienced differ in task length. After commit, 14 tasks carry consecutive dates starting today. The same generation succeeds on the Vercel address.
  Learner check: On the live link, finish onboarding and read the plan Georgina wrote for your illustration goal. Ask for one change. Commit. Say whether the tasks are clear enough that you would know exactly what to do, and whether any feel too big.
  Commit: `Add plan generation, review and commit`

- [x] **4. You can mark today's task done, with a note or photo**
  Becomes usable: Home's "Mark as done" opens the sheet, takes an optional note and photo, and records the task. Home then shows it complete, this week's days fill in, and your if–then plan, your why and a line from Sarah appear.
  Why now: "I either did the task or I didn't" is the centre of the product. The one routine built here is reused by WhatsApp replies, celebrations and progress, so it has to be right before anything depends on it.
  PRD ref: `prd.md > Daily Task and Marking Done`, `prd.md > Weekly Target, Streak, and Celebration` (week record only)
  Spec ref: `spec.md > Components > Daily Task and Mark Done`, `spec.md > Components > Weekly Target, Streak and Celebrations`, `spec.md > Data Model` (`proofs`, `week_records`, `pending_celebrations`), `spec.md > Important Failure Modes` (photo upload fails)
  Build: Add `lib/tasks/complete.ts` (`completeTask`: mark done, save proof, update the week record, work out owed celebrations and return them) and `lib/tasks/weeks.ts`. Add the `proofs`, `week_records` and `pending_celebrations` tables and the private `proofs` storage bucket. Build Home's active layout (handoff §6.6), the mark-done sheet (§4.8), and Home after done (not designed: use existing card styles and agree the wording with the learner).
  Verify (mechanical): `npm run build` passes. A script runs `completeTask` on a test account and checks the task is done with a done time, the proof row exists, the week record went up by one, running it again on the same task changes nothing, and a failed photo upload still leaves the task done.
  Learner check: Mark today's task done with a note and a photo. Reload the page. Say whether the done state feels like a small win, and what you would want Home to say at that moment.
  Commit: `Add mark-as-done with optional proof`

- [x] **5. The house goes up brick by brick, with confetti when you hit your weekly target**
  Becomes usable: Progress shows your house on blueprint paper: finished stages solid, the current stage partly built, the rest dashed, scaffolding up. Each task you mark done adds to it. The roadmap, weekly target and streak sit beside it, and hitting your weekly target fires confetti.
  Why now: Visible progress is the third part of the kernel, and the house is the product's main image. With this, the full loop of task, done, progress works in the app.
  PRD ref: `prd.md > Progress: The House`, `prd.md > Weekly Target, Streak, and Celebration`, `prd.md > Levels and Rewards`
  Spec ref: `spec.md > Components > House and Progress`, `spec.md > Components > Weekly Target, Streak and Celebrations`, `spec.md > Data Model` (worked out when needed), `spec.md > Decisions and Open Issues > Still open` (brick-slot counts)
  Build: Draw `components/house/House.tsx` as one SVG that takes the stage and how full it is (handoff §5), with fixed brick slots per stage, and `SmallHouse.tsx` for Home. Build Progress (§6.7): house, roadmap, weekly target, streak, houses built. Add the confetti celebration and the one-at-a-time queue (§6.11, §7.3), honoring reduced motion. Agree the brick-slot counts with the learner.
  Verify (mechanical): `npm run build` passes. A script checks bricks laid equals the count of done tasks, the current stage is the first unfinished milestone, the streak counts consecutive hit weeks, completing the task that reaches the target returns a weekly celebration exactly once, and lowering the target below the done count returns none until the next task is marked done.
  Learner check: Set your weekly target to 1, mark a task done, and watch for confetti. Open Progress and look at the house. Say whether a single brick feels like progress, and whether the house reads as yours.
  Commit: `Add the house, Progress and weekly celebration`

- [x] **6. Sarah sends today's nudge on WhatsApp, with email backup and the same line on Home**
  Becomes usable: At your chosen time, Sarah sends a motivational line and today's task on WhatsApp when consent, sandbox membership and the reply window allow it; otherwise the same nudge arrives by email. Home shows her same line. "Send my nudge now" in Profile sends it immediately. *(WhatsApp restored Oct 25, 2026 after the learner upgraded Twilio.)*
  Why now: This completes the kernel and is the moment the demo depends on. The free scheduler and email without your own domain need verifying, so it is placed straight after the core loop instead of near the end. After this step there is a version you could submit.
  PRD ref: `prd.md > WhatsApp Nudges and Replies` (first criterion), `prd.md > Missed Days and Re-engagement` (email when WhatsApp is blocked), `prd.md > Sign Up and Profile` (editable settings)
  Spec ref: `spec.md > Components > Nudge Sender`, `spec.md > Components > WhatsApp Inbox` (join and last-message time only), `spec.md > Components > WhatsApp Connection Notice`, `spec.md > Components > Accounts and Profile`, `spec.md > External Services and Dependencies` (Twilio, Resend, Supabase Cron), `spec.md > Decisions and Open Issues > Still open`
  Build: Connect the upgraded Twilio account and Resend with the learner. Add `lib/nudges/` (who is due, channel rule, WhatsApp send, email send) and `nudge_log`, including Sarah's line for Home. Add `/api/cron/tick`, protected by `CRON_SECRET`, and the hourly Supabase Cron job. Connect `/api/whatsapp/inbound` to the sandbox, checking Twilio's signature and recording the join and last-message time. Restore WhatsApp number and consent in sign-up/Profile, and the quiet reconnect notice on Home. Sarah writes the normal nudge with Haiku. Add "Send my nudge now" to Profile (its settings were built in slice 1) and show Sarah's same line on Home. Record what Resend and Supabase Cron actually allow on free plans under Revisions.
  Verify (mechanical): `npm run build` passes. `scripts/check-nudges.mjs` checks the channel rule at its edges (kept for when WhatsApp returns) and that everyone gets email while it is switched off, the due window, that a second scheduled nudge the same day is refused, that `/api/cron/tick` rejects a missing or wrong secret, and that a forged request to the WhatsApp address is rejected. A real WhatsApp nudge returns a Twilio message ID, a real fallback email returns a Resend ID, and Supabase Cron plus its HTTP response history show a successful call.
  Learner check: Join the sandbox and send hello, then press "Send my nudge now" and check WhatsApp on your phone. Open Home and find Sarah's same line. Set your nudge time to the next hour and wait for the scheduled nudge. Say how Sarah's message reads. Check a fallback email too.
  Commit: `Add the daily nudge with WhatsApp and email backup`

## Deferred After Submission

These planned slices are outside the October 26 submission build.

- **7. You can reply on WhatsApp to mark the task done** (deferred)
  Becomes usable: Reply to the nudge with a few words or a photo and the task is marked done, the proof is saved, a brick is added, and Sarah answers. If the reply hit your weekly target, she says so, and the confetti is waiting next time you open the app.
  Why now: It reuses the two pieces just built, the mark-done routine and the WhatsApp address, while both are fresh, and it is the demo's closing beat.
  PRD ref: `prd.md > WhatsApp Nudges and Replies`
  Spec ref: `spec.md > Components > WhatsApp Inbox`, `spec.md > Components > Weekly Target, Streak and Celebrations` (celebration earned by a reply)
  Build: Finish `/api/whatsapp/inbound`: find the person by number, treat text as the note and a picture as the photo, copy the photo into storage, run `completeTask` with source `whatsapp`, store any owed celebration for the next visit, and send Sarah's reply. Handle a reply when today's task is already done or there is no active project.
  Verify (mechanical): `npm run build` passes. A script posts a correctly signed test message with text and checks the task is done, the proof has source `whatsapp`, and a weekly celebration is stored when owed. A second identical message does not complete another task.
  Learner check: Reply to your nudge with a photo of a sketch. Open the app. Say whether the brick, the photo and Sarah's answer are what you expected.
  Commit: `Add marking done by WhatsApp reply`

- **8. You can browse your plan and learning log, a missed task rolls forward, and every task can explain itself** (deferred)
  Becomes usable: Plan shows tasks a week at a time or by a chosen time frame, each marked done, today, missed or upcoming. The learning log tab lists your notes and photos, newest first, and you can add or edit proof on any finished task. Miss a day and the same task is waiting today with the plan shifted. A **?** beside each task opens Georgina's reason for it.
  Why now: Roll-forward is what the missed-day messages in the next step are built on, and until it exists a skipped day leaves Home with no task.
  PRD ref: `prd.md > Roadmap and 2-Week Chunks` (Plan view), `prd.md > Learning Log`, `prd.md > Daily Task and Marking Done` (rolls forward), `prd.md > Why This Task`
  Spec ref: `spec.md > Components > Plan View and Learning Log`, `spec.md > Components > Plan Keeper (roll-forward)`, `spec.md > Components > Why This Task`
  Build: Add `lib/tasks/keep-up.ts` (`bringPlanUpToDate`: mark overdue tasks missed, put the same task on today, shift later tasks one day), run on app open and before each nudge. Build Plan (handoff §6.8): week view, time-frame dropdown, four statuses told apart by shape, the missed wording from §9, where the planned two weeks end. Build the learning log tab and proof editing that touches only the proof. Add the **?** popover on Home and Plan: hover or focus on desktop, tap on a phone.
  Verify (mechanical): `npm run build` passes. A script backdates a test account's tasks by two days, runs `bringPlanUpToDate`, and checks the overdue task is missed, a copy sits on today, and every later task moved by the same amount with none lost. Running it twice changes nothing more. Editing a proof leaves the task's done time and the week record untouched.
  Learner check: Open Plan and switch time frames. Add a note to a task you already finished. Press **?** on a task and read why Georgina chose its numbers. Say whether the missed-task wording feels free of blame.
  Commit: `Add Plan view, learning log, roll-forward and why-this-task`

- **9. Miss a few days and the team eases off, then sends one sincere email** (deferred)
  Becomes usable: After a missed day the nudge is gentle about yesterday, then "just 5 minutes today?", then Sarah invites a chat with the team. After that the daily nudges stop. If the next week starts with still nothing done, one email arrives with your own Outcome, then silence. Marking any task done resets everything.
  Why now: It is the no-guilt promise in the product's own words, and it needs both the nudge sender and roll-forward to exist first.
  PRD ref: `prd.md > Missed Days and Re-engagement`
  Spec ref: `spec.md > Components > Nudge Sender` (message table), `spec.md > External Services and Dependencies > Resend`
  Build: Extend `lib/nudges/due.ts` to pick the message from the days since the last done task, stop after day four, and send the Monday email once. Write Sarah's instructions for each message and the sincere email, with the learner agreeing the wording (not yet designed).
  Verify (mechanical): `npm run build` passes. A script sets the last done task to 0, 1, 2, 3, 4, 5 and 9 days ago and checks which message kind is chosen for each, that nothing is sent after day four, that the Monday email goes once and only once, and that completing a task puts the next day back to a normal nudge.
  Learner check: Read the four messages and the email, generated for your own goal. Say whether any line would make you feel guilty, and which you would reword.
  Commit: `Add the missed-day sequence and re-engagement email`

- **10. You can talk to your team, and change the plan only when you confirm** (deferred)
  Becomes usable: Talk to Team is a chat with history. The right teammate answers, labeled "Name · Role," or you pick one and she hands over when the topic belongs to someone else. A plan change appears as a card with the old task and the new one side by side. Confirm applies it. Decline leaves the plan as it was.
  Why now: It is the largest remaining feature and the one that lets you adjust instead of giving up. It needs the Plan view so a confirmed change has somewhere to show.
  PRD ref: `prd.md > Talk to Team`
  Spec ref: `spec.md > Components > Talk to Team`, `spec.md > Components > Team Brains`, `spec.md > Data Model` (`plan_proposals`)
  Build: Add `lib/ai/router.ts` (pick the teammate, handoff §7.6), the team chat screen (§6.9), the join notice, the teammate picker, `plan_proposals`, the proposal card (§4.6), and confirm or decline. Confirm is the only code that applies a proposal to tasks.
  Verify (mechanical): `npm run build` passes. A script sends "this task is too big," "I'm tired" and "why am I doing this" and checks they route to Georgina, Sarah and Alice. It checks a pending proposal changes no task, declining changes no task, and confirming changes exactly the tasks listed.
  Learner check: Tell the team a task is too big. Decline the first proposal and check Plan is unchanged. Ask again, confirm, and check Plan. Then pick Sarah and ask her about the plan. Say whether the handover felt natural.
  Commit: `Add Talk to Team with confirmed plan changes`

- **11. Finishing a milestone completes a stage, and Georgina plans the next two weeks** (deferred)
  Becomes usable: When a milestone is done, the house gets a "Stage n complete" stamp and a line from Paula. When the planned two weeks run out, Georgina writes the next 14 tasks from what you did and missed, and may bring back earlier practice as a task tagged "Mastery."
  Why now: Without it the app stops after 14 days. It comes after the core is submittable because nobody reaches day 15 during the hackathon, so it is proven with test data.
  PRD ref: `prd.md > Roadmap and 2-Week Chunks` (next chunk), `prd.md > Mastery Tasks (Refreshers)`, `prd.md > Progress: The House` (stage celebration), `prd.md > Weekly Target, Streak, and Celebration` (milestone before weekly)
  Spec ref: `spec.md > Components > Plan Builder` (next chunk), `spec.md > Components > Plan Keeper (roll-forward)`, `spec.md > Components > Weekly Target, Streak and Celebrations`
  Build: Add next-chunk generation to `lib/ai/plan.ts` with the same shape checks, started by `bringPlanUpToDate` when planned tasks run out. Add stage completion to `completeTask`, the stage stamp and Paula's line (handoff §6.11), and the "Mastery" tag using the existing label style.
  Verify (mechanical): `npm run build` passes. A script completes every task of a test milestone and checks a stage celebration is returned and the milestone is done. When that same task also hits the weekly target, both are returned with the stage first. With no planned tasks left, a next chunk of 14 valid tasks is saved and `planned_through` moves on.
  Learner check: On a test account prepared one task short of a milestone, mark the task done and watch the stamp. Open Plan and read the next two weeks. Say whether the new tasks follow on from the old ones.
  Commit: `Add stage celebrations, next-chunk planning and mastery tasks`

- **12. You can abandon a project, with a clear warning first** (deferred)
  Becomes usable: Profile shows your current goal with "Change goal." The warning lists what is deleted forever and what you keep, suggests talking to the team first, and makes "Keep building" the main button. Only "Yes, I want to abandon this project" deletes it, and you are back on the empty lot with your houses-built count intact.
  Why now: It is the only way to start over, which matters as soon as other people try the app, and it must be built after every table that hangs off a project exists so the delete can be checked against all of them.
  PRD ref: `prd.md > Sign Up and Profile` (abandon criteria)
  Spec ref: `spec.md > Components > Accounts and Profile`, `spec.md > Data Model` (abandoning a project)
  Build: Add the abandon dialog (handoff §7.5, §4.8), the one place besides the ribbon where red is used. Confirm the cascade in the migrations, delete the project, and remove its photos from storage.
  Verify (mechanical): `npm run build` passes. A script abandons a test project that has tasks, proofs, a photo, chats and a proposal, then checks no row or file tied to it remains and the profile, `houses_built`, week records and dream are unchanged.
  Learner check: On a second test account, abandon the project. Read the warning as if it were your real illustration goal. Say whether it is clear enough about what you lose.
  Commit: `Add the abandon flow`

- **13. The scaffolding comes down, you cut the ribbon, and you start your next house** (deferred)
  Becomes usable: When the last task of the last milestone is done, the finished house is revealed and waits for you to cut the ribbon. Your houses-built count goes up by one, and you are offered a next house.
  Why now: It is the ending the name promises. It sits late because it can only be reached with test data during the hackathon and nothing else depends on it.
  PRD ref: `prd.md > Progress: The House` (house complete, next house)
  Spec ref: `spec.md > Components > House and Progress`, `spec.md > Data Model` (completing a house)
  Build: Add house completion to `completeTask` (project complete, `houses_built` plus one), the finished state of the house, and the ribbon-cutting ceremony (handoff §6.11) that never cuts on its own, with a reduced-motion version. Offer a new goal with Alice afterward.
  Verify (mechanical): `npm run build` passes. A script completes the final task of a test project and checks the project is complete, `houses_built` rose by exactly one, a house celebration is owed, and running it again does not add a second house.
  Learner check: On a test account prepared one task from the end, mark it done and cut the ribbon. Say whether the moment feels earned.
  Commit: `Add the house-complete ceremony`

- **14. Alice helps you find a goal, and a big dream becomes a path of houses** (deferred)
  Becomes usable: Before a goal exists, Talk to Team is a chat with Alice. Name an interest and she offers three goal ideas. Name a big dream and Georgina joins to break it into a path of smaller goals. "Design this goal with Alice" opens onboarding with the Wish filled in, and Home and Progress show "House n of m."
  Why now: It serves people who arrive without a goal. The first user arrives with one, so every earlier step works without it, and it is the safest piece to drop if the deadline gets close.
  PRD ref: `prd.md > Finding a Goal, Dreams, and Paths`
  Spec ref: `spec.md > Components > Goal Finder, Dreams and Paths`, `spec.md > Components > Plan Builder` (path), `spec.md > Data Model` (`dreams`, `path_steps`)
  Build: Add the `dreams` and `path_steps` tables, the goal-finder chat (handoff §6.3), path generation in `lib/ai/plan.ts`, the hand-off into onboarding, "House n of m" on Home and Progress, and offering the next path step after a house is complete. The dream survives abandoning its current house.
  Verify (mechanical): `npm run build` passes. A script gives an interest and checks three goal ideas come back, gives a dream and checks an ordered path is saved with one current step, starts onboarding from a path step and checks the Wish is filled in, and abandons that project and checks the dream remains.
  Learner check: On a fresh account, tell Alice a big dream of your own. Read the path. Say whether the first step is small enough to start this week.
  Commit: `Add goal finder, dreams and paths`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1, the look and the menu on your own phone, before any screen is built on top of them
- [x] Core journey explored end to end — after slice 6, from sign-up to WhatsApp/manual and scheduled email nudges on the live link; learner confirmed receipt and the revised greeting on October 26
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Write a short plain-language Privacy Policy and Terms, add them as pages, and restore the legal line on sign-up (handoff §6.0b) with working links. Include how to stop WhatsApp messages and how to have an account deleted. Agreed with the learner on Oct 10, 2026; the line was removed until then.
- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions

- Slice 6 completed learner checks (Oct 26, 2026): the learner confirmed today's automatic email receipt after confirming manual WhatsApp delivery, the matching Home line and the neutral greeting revision. Today's actual scheduler send provides the hands-on evidence instead of moving the chosen time to the next hour: the daily claim already exists and is preserved. Mechanical checks pass, real incoming routing works, and the core-journey checkpoint is complete.

- Slice 6 greeting retry confirmed (Oct 26, 2026): after being asked to resend and compare WhatsApp with Home, the learner replied "ok good". Build, lint, focused greeting checks and the existing live nudge checks pass; disposable accounts are removed. The remaining learner check is today's automatic email receipt, which has been requested.

- Slice 6 wording feedback (Oct 26, 2026): the learner received "morning" in an evening manual send and requested neutral "Hi" wording. The shared nudge composer now adds the greeting itself, asks Sarah for time-neutral encouragement without a greeting, and falls back to the existing neutral line if the generated text mentions a time of day. The composed line is shared by WhatsApp, email and Home. Local webpack build, lint, named/unnamed greeting and AI-fallback checks passed. Vercel's normal Turbopack build passed; deployment `dpl_Ha617Jv5reymG5gSAmqWPmrfXcE6` is live. Learner retry pending.

- Slice 6 manual learner check (Oct 26, 2026): the learner pressed Profile's send button and confirmed receiving the WhatsApp nudge. Twilio's corresponding message at 18:54:08 UTC is `read`, without an error. Still awaiting the Home comparison, wording feedback and today's automatic email receipt report before completion.

- Slice 6 real incoming route verified (Oct 26, 2026): after the newer Console's terms step and a rejoin/hello test, Twilio recorded the learner's actual messages and Scaffold saved join/last-inbound timestamps at 18:50:30.416 UTC. The empty reply is the implemented slice 6 behavior. No webhook URL edit or synthetic profile timestamp was used; the precise cause of the previous default reply remains unproven. All automated live nudge checks passed again and disposable accounts were removed. The real account also received a scheduled email provider receipt at 12:00 UTC today. Awaiting learner confirmation of manual WhatsApp delivery, the matching Home line, Sarah's wording and automatic delivery. Today's existing scheduled claim must be preserved.

- Slice 6 WhatsApp delivery verified (Oct 25, 2026): after the learner completed Twilio verification, the deployed real-send check passed both channels: a WhatsApp message returned a Twilio `SM` receipt, email returned a Resend receipt, and ringing the bell twice sent no duplicate. All five disposable accounts were removed. The learner confirmed receiving the WhatsApp message. The compliance refusal is resolved. Still to confirm: the real sandbox callback updates Scaffold, the Profile manual-send and hourly learner check, and Sarah's wording. Slice 6 stays unchecked until those checks are complete.

- Slice 6 scheduler verified (Oct 25, 2026): the learner saved `cron_secret` in Scaffold's Supabase Vault themselves. Applied `0008_nudge_bell.sql`. The active `nudge-bell` job has schedule `0 * * * *`. A temporary one-minute copy ran successfully at 14:36 UTC and its pg_net HTTP response was 200 (`checked: 0`, `sent: 0`); the temporary job was removed, leaving only the hourly job. The deployed email-only path returned a real Resend receipt and the repeated bell sent no duplicate. The real WhatsApp test failed: Twilio reports that the Primary compliance profile is not approved and requires its KYC process in Trust Hub, despite the account being Full/active and a fresh inbound message opening the window. All disposable accounts were removed. The test fixture now uses the owner's real email for both delivery paths so a blocked WhatsApp send can exercise fallback without sending to a nonexistent test mailbox. Still pending: learner completes Twilio verification, the sandbox inbound webhook is confirmed, a real WhatsApp receipt succeeds, and the learner tries manual plus scheduled nudges and reviews Sarah's wording. Slice 6 remains unchecked; the app and hourly scheduler remain usable by email.

- Slice 6 WhatsApp restored (Oct 25, 2026): the learner saved the Resend key, upgraded Twilio, and explicitly chose WhatsApp as the main nudge channel again, with email backup and the same line on Home. Twilio's account API confirms `Full` and `active`. Restored the approved sign-up/Profile number and consent fields, onboarding/review wording and Home reconnect notice. `WHATSAPP_SENDING=on` locally and in production. The restored build is deployed at https://scaffold-theta-three.vercel.app (deployment `dpl_H5nZzd7XgQdNV3Q4bQzD854SQFrS`), with the service settings encrypted in Vercel. Local production build, lint, page/account checks and a real email receipt pass. The learner must reopen the WhatsApp window (last inbound was Oct 23) and sign in to the Twilio Console before its inbound webhook can be connected. Approval to store the existing scheduler credential in Supabase Vault/install the hourly job is pending. Real WhatsApp delivery and scheduler verification are still pending. A delivery failure now retains the saved line on Home. This supersedes the Oct 23 email-only decision; slice 7 is again the next planned slice, and is not yet implemented.

- Slice 6 resumed (Oct 25, 2026): applied the saved `0007_nudge_line.sql` migration to Scaffold's Supabase project after the expanded check found that `nudge_log.line` was missing. Home now keeps Sarah's saved email line after today's task is marked done, and a successful manual send refreshes the client router. The nudge script now checks exact WhatsApp expiry boundaries, saved-line rendering before and after completion, and private access; email-only real checks no longer require a WhatsApp number. Database and nudge checks pass and disposable accounts were removed. Also repaired a logged-out landing-page redirect loop found by `check-pages.mjs`; all page checks pass. Added a request boundary before initializing server-side Supabase auth after the running app exposed its clock read during speculative prerendering. Slice 6 remains unchecked: the local Resend key is empty (the test sender is now configured), production has none of the nudge settings, and the database has neither Cron nor pg_net installed. Still required: connect Resend, deploy/configure the nudge code, install the hourly job, verify a real Resend ID and scheduler HTTP success, and complete the learner's manual/scheduled email check.

- Slice 6 WhatsApp on hold (Oct 23, 2026): Twilio's free trial refused the app's own WhatsApp text (error 21654, "ContentSid Required"), even right after the learner joined the sandbox and wrote to it. Twilio's trial guide confirms trial accounts can only send Twilio's own templates. Offered upgrading Twilio (a small top-up, recommended), email only, or reply-only. The learner chose to stay free: **version 1 nudges by email and shows Sarah's same line on Home**. Removed the WhatsApp number and consent from sign-up and Profile, the reconnect notice, and WhatsApp wording in onboarding and plan review. WhatsApp code stays, switched off by `WHATSAPP_SENDING`. Slice 7 is on hold. The scope's kernel and demo moment now read "email", recorded in `scope.md`, `prd.md` and `spec.md`. Consequence: until a domain is connected to Resend, only the account owner's address receives email.

- Slice 6 bell (Oct 23, 2026): the learner chose an hourly bell and nudge times on the hour (24 choices in Profile) instead of every 15 minutes, for simplicity. Typed times in onboarding round to the nearest hour, existing times moved to the nearest hour, and the database now refuses times that aren't on the hour. Where the clock is offset by half an hour (India, for example) the nudge arrives 30 minutes late. Considered and dropped: three fixed choices (9:00, 12:00, 17:00).
- Slice 6 "Send my nudge now" sends a fresh nudge each time it is pressed (at most one a minute) and doesn't count toward the one scheduled nudge a day. Without this the learner check couldn't press the button and then wait for the scheduled nudge on the same day. The scheduled nudge is skipped if today's task is already done.
- Slice 6 added `lib/nudges/message.ts` (Sarah's line plus the task copied from the plan), `lib/nudges/send.ts` (the sender both the bell and the button use) and `lib/nudges/inbound.ts`. Twilio may not pass on the "join" message itself, so a join is also recorded from the first message after the last recorded join expired.

- Slice 5 layout feedback (Oct 22, 2026): the learner found the house small and too much grey space on a wide desktop, and asked for layouts that adapt across web and mobile. Pages now grow from about 1040px (handoff §3.1) up to 1440px on very wide screens, with fluid sizing and no second breakpoint. Inside the app the house drawing is trimmed to its own outline so it fills its card (the landing page keeps the full canvas). Home on desktop puts today's task on the left and the house, week, if–then plan and Sarah on the right; the phone keeps the §6.6 order. On phones the stage names sit as one wrapping line under the stage bar, because five labels don't fit under the segments at 360px. Checked with screenshots at 2560, 1280, 390 and 360px wide, with no sideways scrolling.
- Slice 5 learner check, first try: no confetti, as designed, because the weekly target was still 3 (1 of 3 days done). A disposable demo login with a target of 1 was prepared for the check; delete it afterwards.

- Slice 5 brick slots (Oct 21, 2026): the learner chose 12 pieces per stage (51 for walls), each stage filling by percentage like a progress bar. "Bricks laid" stays the count of finished tasks. A stage is drawn just short of full until it is really finished, because a two-week plan can end partway through a stage. Until slice 11 marks milestones done, a stage counts as finished when all its planned tasks are done and the plan has moved on to a later stage. Slice 11 should keep the drawing from shrinking when a new chunk adds tasks to a stage that is already partly built.
- Slice 5 weekly celebration: Sarah's line uses "That's your target for the week. Anything more this week is a bonus, not a must." in place of the handoff's example "That's a full week of work…", which reads oddly for a target of one or two days. Kept by the learner (Oct 22).
- Slice 5 owed celebrations are checked on every app screen and shown one at a time; closing one marks it shown. Only the weekly kind is drawn so far; stage and house celebrations stay owed until slices 11 and 13 build their screens.

- Slice 4 learner check (Oct 21, 2026): the learner marked a task done with a photo and reloaded; the done state felt like a small win. Home's wording is agreed as is: “Today’s brick is laid” / “You can keep practising, or call it a day. Your progress is saved.” The learner also confirmed password recovery now works.

- Slice 4 Home rendering fix (Oct 20, 2026): the learner encountered Next.js’s unstable `Date.now()` prerender error on Home. Added an explicit request boundary (`await connection()`) before Home reads today’s date or creates expiring photo URLs. The webpack production build, lint and real completion checks (including Home after saving a photo) pass; disposable test data was removed.

- Slice 4 photo-picker feedback (Oct 20, 2026): replaced the plain browser file input with a full-width outlined “Attach a photo” button. Selecting a file shows its name and changes the button to “Change photo.” The optional label and file limits remain visible.

- Password recovery follow-up (Oct 20, 2026): the learner reported an expired-link error. The callback previously labeled every unsuccessful handoff expired, including missing browser verification and fragment-only legacy links. Local fix lets the browser handle fragment sessions and distinguishes missing verification cookies, expired codes and other verification failures. The request screen now asks for the newest email in the same browser/device; recovery links also use text-sized click areas. Lint, TypeScript and `scripts/check-recovery-callback.mjs` pass. The learner’s exact failure cause and successful retry remain unconfirmed; these changes are local.

- Slice 4 implementation committed at the learner’s explicit request (Oct 19, 2026), on `develop`. The slice remains unchecked because the hands-on learner check has not yet been reported. Applied `0005_task_completion.sql` to the existing Scaffold Supabase project. Home now offers optional note/photo completion, a saved done state, private saved-photo link, Monday-based weekly tracker, if–then reminders and a line from Sarah. Done-state wording remains available for learner feedback: “Today’s brick is laid” / “You can keep practising, or call it a day. Your progress is saved.”
- Slice 4 login feedback: reduced the forgot-password link to the text’s bounds. The learner added `http://localhost:3000/auth/callback` to Supabase’s allowed redirects; `scripts/check-recovery.mjs http://localhost:3000` confirms the local destination and one-use recovery flow with a disposable account, which was removed.
- Slice 4 verification: `npm run build -- --webpack`, TypeScript, lint and `scripts/check-completion.mjs` pass. The script checks real completion with a note and photo, saved done time/proof/week record, duplicate and concurrent requests, a rejected photo leaving completion saved, same-day tasks counting as one day, weekly celebration queued once, Home after reload, ownership and private photo access. Disposable accounts and uploaded photos were removed. The default Turbopack build still hits the previously recorded worker-port restriction; webpack now runs the existing Tailwind loader too, and its output was checked for compiled utilities. Use `npm run dev -- --webpack` for this environment.
- Slice 4 saves completion, proof note, week count and owed weekly celebration in one database transaction; photo storage follows separately so a photo failure cannot undo completion. Photos are optional JPG/PNG/WebP, with a 3 MB picker limit to fit hosted request limits. Stage/house completion decisions remain in slice 11: exhausting the first generated chunk cannot prove the entire milestone is complete. Home’s small growing house remains in slice 5, where its drawing and brick counts are planned.

- Slice 3 feedback: keep the building metaphor light in conversation. The learner prefers "How many days a week would you like to work on your project?" over "do you want to build?" Updated Alice's introduction, days question and WOOP transition, plus shared teammate instructions and weekly-target context. Questions and tasks should use the person's actual activity, goal or project; the house remains the progress visual and role names stay.

- During slice 3's learner check, the learner could not log in and reported the missing forgot-password option. Added and deployed a reset-email request, PKCE callback, new-password screen, login link, and public recovery routes. The learner corrected Supabase's Site URL and allowed the production callback. Build and lint pass. A disposable-account test verified the recovery destination, one-use token, password update, rejection of the old password and login with the new password. Their own password is entered only by them. The learner subsequently regained access and completed the plan check.

- Slice 3 complete (Oct 19, 2026; code checkpoint `473fabc`): implemented and deployed to https://scaffold-theta-three.vercel.app. The learner confirmed that Georgina revised their plan and that they committed to it. The learner restored Supabase and successfully applied `0004_plans.sql`. Production build passes locally with webpack and on Vercel with the normal `npm run build`; lint and `scripts/check-plan-shape.mjs` pass. `scripts/check-plan.mjs` passed locally and on the live site: generation, saved-draft recovery, shorter tasks on request, cross-user access rules, stale-revision rejection, 14 consecutive dates in the builder's zone, idempotent commitment, and Home's real first task. Live beginner and experienced plans averaged 7.2 and 23.9 minutes. Disposable accounts were removed. The existing Claude key was added to Vercel's sensitive production settings; production uses the default plan model. The learn-mode learner check is complete: the learner requested a change and committed to the revised plan. Their wording feedback was addressed before this confirmation.
- Slice 3 stores the validated draft JSON and a revision number on `projects`, and task quantity plus per-item time on `tasks`. The database checks the arithmetic too. Draft replacement and commitment each run in one transaction, and a stale tab cannot commit a revision the learner has not reviewed.
- The local default Turbopack build hit an environment restriction opening a port. The same production build passed with Next.js's webpack option; the project's chosen framework and default build command are unchanged.

- Slice 1 grew to include a public landing page and a redesigned sign-up screen — the learner delivered a new version of the design handoff (§6.0, §6.0b) after slice 1 was first built. `prd.md > Landing Page`, `spec.md > Components > Landing Page` and a `whatsapp_consent` column were added.
- The house drawing (`components/house/House.tsx`) was started in slice 1 instead of slice 5 — the landing page's hero shows the real in-progress house. Slice 5 finishes it (stage-complete and finished looks, agreed slot counts).
- Slice 3's plan checks also verify each task's total time (count × minutes) and that its "About n minutes" label equals that total — the new handoff §7.1 added this rule. The limit is 30 minutes.
- Slice 6's channel rule also requires WhatsApp consent — sign-up now records whether the person agreed to daily WhatsApp messages.
- Editing in Profile (name, email, WhatsApp number, weekly target, nudge time, WhatsApp consent) moved from slice 6 into slice 1 — at the first hands-on check the learner asked to be able to edit everything in Profile straight away. Slice 6 keeps "Send my nudge now".
- After sign-up a new user lands on the empty-lot Home, not the onboarding chat as the handoff §6.0b says — the learner asked for this at the first hands-on check. Confirmed by the learner on Oct 10, 2026.
- The task limit rose from 20 to 30 minutes, with length chosen for each person — the learner decided this after the first hands-on check. Slice 3's checks, `prd.md > Roadmap and 2-Week Chunks` and `spec.md > Components > Plan Builder` were updated. No new settings screen: length changes go through "Ask for changes" and Talk to Team.
- The onboarding chat moved from `app/(app)/onboarding/` to `app/(focus)/onboarding/` — the handoff §6.4 draws it full-height with its own header, and on a phone the bottom tabs would sit on top of the answer box. Same address, `/onboarding`.
- `messages` gained a `chips` column — Alice's suggested replies have to survive closing the tab, or "Continue where you left off" would reopen without them.
- The browser can only read `projects`, `conversations` and `messages`; the server does every write — the houses-built count and week records will depend on project status, so it must not be editable from outside the app.
- Each free-text answer (Wish, experience, Outcome, Obstacle) gets a quick yes/no read by Haiku before it is saved — without it, asking Alice a question back ("what's an outcome?") was saved as the answer. Tapped suggestions skip the read. The same read decides whether an Obstacle is too general.
- `zod` was installed in slice 2 instead of slice 3 — the yes/no read uses the same fixed-shape reply the plan will.
