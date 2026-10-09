---
doc: checklist
status: approved
---

# Build Checklist

Build mode: [learn or fast — record once chosen; carry forward on resume]

## Slices

- [ ] **1. You can sign up, log in, and land on the empty lot, on a live link**
  Becomes usable: A real website at a `*.vercel.app` address in the Blueprint look. You can create an account, log out and back in, and move between Home, Progress, Plan, Talk to Team and Profile. Each shows its "before a goal" state pointing to Alice.
  Why now: Everything else lands on this. Putting it on the live link now, instead of at the end, means any hosting or account problem shows up on day one while it is cheap to fix.
  PRD ref: `prd.md > Sign Up and Profile`, `prd.md > Screens and Layout`, `prd.md > States and Boundaries` (first use), `prd.md > Look and Feel`
  Spec ref: `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`, `spec.md > Components > App Shell and Navigation`, `spec.md > Components > Accounts and Profile`, `spec.md > Data Model` (`profiles`), `spec.md > File Structure`
  Build: Scaffold Next.js 16 in a temporary folder and copy it in. Copy the handoff's tokens (§2) into `app/globals.css`, load the two fonts, build the shared pieces (Button, Card, Chip, icons) and the shell (sidebar at 700px and above, top bar plus bottom tabs below). Create the Supabase project with the learner, add the `profiles` table and its access rule as a migration, sign-up (email, password, WhatsApp number, time zone from the browser) and log-in, and `proxy.ts` for logged-out visitors. Build the empty-lot Home (handoff §6.1) and the empty states for Progress, Plan, Team and Profile (§6.2, §6.3 static, §7.7). Add `.env.example` and a README. Connect the GitHub repository to Vercel and deploy.
  Verify (mechanical): `npm run build` finishes with no errors. A script signs up a throwaway account against Supabase, confirms its `profiles` row exists with a time zone, confirms a second account cannot read it, then deletes it. A logged-out request to `/` redirects to log-in. The Vercel address returns the log-in page.
  Learner check: Open the Vercel link on your phone and on your laptop. Sign up, look at all five menus, log out, log back in. Say whether it looks like your Blueprint design and whether anything feels off.
  Commit: `Add app shell, sign-up and the empty lot`

- [ ] **2. You can do the onboarding and WOOP chat with Alice, and pick up where you left off**
  Becomes usable: "Design my goal with Alice" opens a real chat. Alice welcomes you, asks your name, nudge time and days per week, then Wish, prior experience, Outcome and Obstacle, with quick replies and the step bar. Close the tab mid-way and Home offers "Continue where you left off."
  Why now: This is the first time the app talks to Claude, so it is where we find out whether the AI setup works as the spec assumes. Everything Georgina writes later depends on these saved answers.
  PRD ref: `prd.md > Onboarding and WOOP Goal Setting`, `prd.md > The Core Journey` (steps 2–3)
  Spec ref: `spec.md > Components > Team Brains`, `spec.md > Components > Onboarding Conversation`, `spec.md > External Services and Dependencies > Claude (Anthropic)`, `spec.md > Data Model` (`projects`, `conversations`, `messages`), `spec.md > Important Failure Modes` (chat reply fails)
  Build: Load the `claude-api` skill first and confirm both model IDs in the spec answer a one-line request. Add `lib/ai/` (client, teammates with the handoff §9 voice table, context), the `/api/chat` streaming route, the `projects`, `conversations` and `messages` tables, and the onboarding screen (handoff §6.4, chat pieces §4.5, stepper). Save each answer before asking for Alice's next message. Alice's instructions cover the vague-obstacle follow-up and the Screen Time suggestion. Add the resume card on Home and the light "Start over" confirmation. Set a spending cap in the Claude Console with the learner.
  Verify (mechanical): `npm run build` passes. A script walks a test account through every onboarding step, checks the project row holds each answer and the right `onboarding_step` after each, checks that "life gets busy" produces a follow-up question rather than moving on, and checks that reloading mid-way returns the saved step.
  Learner check: Do the chat as yourself with your illustration goal. Stop after the Wish, close the tab, come back and continue. Give a vague obstacle once and see what Alice does. Say whether she sounds like the Alice you designed.
  Commit: `Add onboarding and WOOP chat with Alice`

- [ ] **3. Georgina builds your plan, and you commit to it**
  Becomes usable: After the Obstacle, Georgina draws up five milestones and 14 daily tasks of 20 minutes or less, with an if–then plan. You can ask for changes, then press "I commit to this plan," and Home switches from the empty lot to today's task.
  Why now: This is the first half of the kernel: a goal turned into one small, clear task a day. It also carries the biggest technical unknown, a slow AI request on the free hosting plan, so it is tested on the live link here rather than discovered later.
  PRD ref: `prd.md > Roadmap and 2-Week Chunks`, `prd.md > Why This Task` (the explanation is written with the task), `prd.md > The Core Journey` (steps 4–5)
  Spec ref: `spec.md > Components > Plan Builder`, `spec.md > Components > Plan Review and Commit`, `spec.md > Data Model` (`milestones`, `tasks`), `spec.md > Important Failure Modes` (slow plan, wrong shape), `spec.md > Decisions and Open Issues > Still open` (Vercel time limit)
  Build: Add `lib/ai/plan.ts` with the fixed plan shape and its checks (five milestones, no task over 20 minutes, at least one if–then, a "why" per task), one silent retry, then the calm "Try again" state. Model comes from `PLAN_MODEL`. Add the `milestones` and `tasks` tables, the plan review screen (handoff §6.5), "Ask for changes" to Georgina, and commit (project active, tasks dated from today in the person's time zone). Add `lib/dates.ts`. Home shows the goal and today's task card, read-only for now. If the hosted request times out, split plan generation into two smaller requests and record it under Revisions.
  Verify (mechanical): `npm run build` passes. A script generates a plan from fixed WOOP answers and asserts five milestones, 14 tasks, every task 20 minutes or less with a non-empty "why," and at least one if–then. It feeds the checker a deliberately bad plan (a 30-minute task, four milestones) and confirms both are rejected. After commit, 14 tasks carry consecutive dates starting today. The same generation succeeds on the Vercel address.
  Learner check: On the live link, finish onboarding and read the plan Georgina wrote for your illustration goal. Ask for one change. Commit. Say whether the tasks are clear enough that you would know exactly what to do, and whether any feel too big.
  Commit: `Add plan generation, review and commit`

- [ ] **4. You can mark today's task done, with a note or photo**
  Becomes usable: Home's "Mark as done" opens the sheet, takes an optional note and photo, and records the task. Home then shows it complete, this week's days fill in, and your if–then plan, your why and a line from Sarah appear.
  Why now: "I either did the task or I didn't" is the centre of the product. The one routine built here is reused by WhatsApp replies, celebrations and progress, so it has to be right before anything depends on it.
  PRD ref: `prd.md > Daily Task and Marking Done`, `prd.md > Weekly Target, Streak, and Celebration` (week record only)
  Spec ref: `spec.md > Components > Daily Task and Mark Done`, `spec.md > Components > Weekly Target, Streak and Celebrations`, `spec.md > Data Model` (`proofs`, `week_records`, `pending_celebrations`), `spec.md > Important Failure Modes` (photo upload fails)
  Build: Add `lib/tasks/complete.ts` (`completeTask`: mark done, save proof, update the week record, work out owed celebrations and return them) and `lib/tasks/weeks.ts`. Add the `proofs`, `week_records` and `pending_celebrations` tables and the private `proofs` storage bucket. Build Home's active layout (handoff §6.6), the mark-done sheet (§4.8), and Home after done (not designed: use existing card styles and agree the wording with the learner).
  Verify (mechanical): `npm run build` passes. A script runs `completeTask` on a test account and checks the task is done with a done time, the proof row exists, the week record went up by one, running it again on the same task changes nothing, and a failed photo upload still leaves the task done.
  Learner check: Mark today's task done with a note and a photo. Reload the page. Say whether the done state feels like a small win, and what you would want Home to say at that moment.
  Commit: `Add mark-as-done with optional proof`

- [ ] **5. The house goes up brick by brick, with confetti when you hit your weekly target**
  Becomes usable: Progress shows your house on blueprint paper: finished stages solid, the current stage partly built, the rest dashed, scaffolding up. Each task you mark done adds to it. The roadmap, weekly target and streak sit beside it, and hitting your weekly target fires confetti.
  Why now: Visible progress is the third part of the kernel, and the house is the product's main image. With this, the full loop of task, done, progress works in the app.
  PRD ref: `prd.md > Progress: The House`, `prd.md > Weekly Target, Streak, and Celebration`, `prd.md > Levels and Rewards`
  Spec ref: `spec.md > Components > House and Progress`, `spec.md > Components > Weekly Target, Streak and Celebrations`, `spec.md > Data Model` (worked out when needed), `spec.md > Decisions and Open Issues > Still open` (brick-slot counts)
  Build: Draw `components/house/House.tsx` as one SVG that takes the stage and how full it is (handoff §5), with fixed brick slots per stage, and `SmallHouse.tsx` for Home. Build Progress (§6.7): house, roadmap, weekly target, streak, houses built. Add the confetti celebration and the one-at-a-time queue (§6.11, §7.3), honoring reduced motion. Agree the brick-slot counts with the learner.
  Verify (mechanical): `npm run build` passes. A script checks bricks laid equals the count of done tasks, the current stage is the first unfinished milestone, the streak counts consecutive hit weeks, completing the task that reaches the target returns a weekly celebration exactly once, and lowering the target below the done count returns none until the next task is marked done.
  Learner check: Set your weekly target to 1, mark a task done, and watch for confetti. Open Progress and look at the house. Say whether a single brick feels like progress, and whether the house reads as yours.
  Commit: `Add the house, Progress and weekly celebration`

- [ ] **6. Your phone buzzes with today's task on WhatsApp**
  Becomes usable: At your chosen time, Sarah sends one WhatsApp message with a motivational line and today's task. "Send my nudge now" in Profile sends it immediately. If WhatsApp cannot reach you, the same message arrives by email and Home shows how to reconnect. Profile lets you change your name, weekly target, nudge time and contact details.
  Why now: This completes the kernel and is the moment the demo depends on. It also depends on three things nobody has verified yet (the free scheduler, WhatsApp's rules, and email without your own domain), so it is placed straight after the core loop instead of near the end. After this step there is a version you could submit.
  PRD ref: `prd.md > WhatsApp Nudges and Replies` (first criterion), `prd.md > Missed Days and Re-engagement` (email when WhatsApp is blocked), `prd.md > Sign Up and Profile` (editable settings)
  Spec ref: `spec.md > Components > Nudge Sender`, `spec.md > Components > WhatsApp Inbox` (join and last-message time only), `spec.md > Components > WhatsApp Connection Notice`, `spec.md > Components > Accounts and Profile`, `spec.md > External Services and Dependencies` (Twilio, Resend, Supabase Cron), `spec.md > Decisions and Open Issues > Still open`
  Build: Set up Twilio and Resend with the learner. Add `lib/nudges/` (who is due, channel rule, WhatsApp send, email send) and `nudge_log`. Add `/api/cron/tick`, protected by `CRON_SECRET`, and the 15-minute Supabase Cron job. Add `/api/whatsapp/inbound` far enough to check Twilio's signature and record the join and last-message time. Sarah writes the normal nudge with Haiku. Build Profile's settings (handoff §6.10, without the abandon flow) with "Send my nudge now," and the connection notice on Home. Record what Resend and Supabase Cron actually allow on free plans under Revisions.
  Verify (mechanical): `npm run build` passes. A script checks the channel rule at its edges (23 and 25 hours since the last message, joined 2 and 4 days ago) and that a second nudge the same day is refused. A request to `/api/cron/tick` without the secret is rejected. A forged request to the WhatsApp address is rejected. A real send returns a Twilio message ID, a real email returns a Resend ID, and the Supabase Cron run history shows a successful call.
  Learner check: Join the sandbox from your phone, press "Send my nudge now," and wait for the buzz. Then set your nudge time to the next quarter hour and wait for it to arrive on its own. Say how Sarah's message reads on a real phone.
  Commit: `Add the daily nudge by WhatsApp and email`

- [ ] **7. You can reply on WhatsApp to mark the task done**
  Becomes usable: Reply to the nudge with a few words or a photo and the task is marked done, the proof is saved, a brick is added, and Sarah answers. If the reply hit your weekly target, she says so, and the confetti is waiting next time you open the app.
  Why now: It reuses the two pieces just built, the mark-done routine and the WhatsApp address, while both are fresh, and it is the demo's closing beat.
  PRD ref: `prd.md > WhatsApp Nudges and Replies`
  Spec ref: `spec.md > Components > WhatsApp Inbox`, `spec.md > Components > Weekly Target, Streak and Celebrations` (celebration earned by a reply)
  Build: Finish `/api/whatsapp/inbound`: find the person by number, treat text as the note and a picture as the photo, copy the photo into storage, run `completeTask` with source `whatsapp`, store any owed celebration for the next visit, and send Sarah's reply. Handle a reply when today's task is already done or there is no active project.
  Verify (mechanical): `npm run build` passes. A script posts a correctly signed test message with text and checks the task is done, the proof has source `whatsapp`, and a weekly celebration is stored when owed. A second identical message does not complete another task.
  Learner check: Reply to your nudge with a photo of a sketch. Open the app. Say whether the brick, the photo and Sarah's answer are what you expected.
  Commit: `Add marking done by WhatsApp reply`

- [ ] **8. You can browse your plan and learning log, a missed task rolls forward, and every task can explain itself**
  Becomes usable: Plan shows tasks a week at a time or by a chosen time frame, each marked done, today, missed or upcoming. The learning log tab lists your notes and photos, newest first, and you can add or edit proof on any finished task. Miss a day and the same task is waiting today with the plan shifted. A **?** beside each task opens Georgina's reason for it.
  Why now: Roll-forward is what the missed-day messages in the next step are built on, and until it exists a skipped day leaves Home with no task.
  PRD ref: `prd.md > Roadmap and 2-Week Chunks` (Plan view), `prd.md > Learning Log`, `prd.md > Daily Task and Marking Done` (rolls forward), `prd.md > Why This Task`
  Spec ref: `spec.md > Components > Plan View and Learning Log`, `spec.md > Components > Plan Keeper (roll-forward)`, `spec.md > Components > Why This Task`
  Build: Add `lib/tasks/keep-up.ts` (`bringPlanUpToDate`: mark overdue tasks missed, put the same task on today, shift later tasks one day), run on app open and before each nudge. Build Plan (handoff §6.8): week view, time-frame dropdown, four statuses told apart by shape, the missed wording from §9, where the planned two weeks end. Build the learning log tab and proof editing that touches only the proof. Add the **?** popover on Home and Plan: hover or focus on desktop, tap on a phone.
  Verify (mechanical): `npm run build` passes. A script backdates a test account's tasks by two days, runs `bringPlanUpToDate`, and checks the overdue task is missed, a copy sits on today, and every later task moved by the same amount with none lost. Running it twice changes nothing more. Editing a proof leaves the task's done time and the week record untouched.
  Learner check: Open Plan and switch time frames. Add a note to a task you already finished. Press **?** on a task and read why Georgina chose its numbers. Say whether the missed-task wording feels free of blame.
  Commit: `Add Plan view, learning log, roll-forward and why-this-task`

- [ ] **9. Miss a few days and the team eases off, then sends one sincere email**
  Becomes usable: After a missed day the nudge is gentle about yesterday, then "just 5 minutes today?", then Sarah invites a chat with the team. After that the daily nudges stop. If the next week starts with still nothing done, one email arrives with your own Outcome, then silence. Marking any task done resets everything.
  Why now: It is the no-guilt promise in the product's own words, and it needs both the nudge sender and roll-forward to exist first.
  PRD ref: `prd.md > Missed Days and Re-engagement`
  Spec ref: `spec.md > Components > Nudge Sender` (message table), `spec.md > External Services and Dependencies > Resend`
  Build: Extend `lib/nudges/due.ts` to pick the message from the days since the last done task, stop after day four, and send the Monday email once. Write Sarah's instructions for each message and the sincere email, with the learner agreeing the wording (not yet designed).
  Verify (mechanical): `npm run build` passes. A script sets the last done task to 0, 1, 2, 3, 4, 5 and 9 days ago and checks which message kind is chosen for each, that nothing is sent after day four, that the Monday email goes once and only once, and that completing a task puts the next day back to a normal nudge.
  Learner check: Read the four messages and the email, generated for your own goal. Say whether any line would make you feel guilty, and which you would reword.
  Commit: `Add the missed-day sequence and re-engagement email`

- [ ] **10. You can talk to your team, and change the plan only when you confirm**
  Becomes usable: Talk to Team is a chat with history. The right teammate answers, labeled "Name · Role," or you pick one and she hands over when the topic belongs to someone else. A plan change appears as a card with the old task and the new one side by side. Confirm applies it. Decline leaves the plan as it was.
  Why now: It is the largest remaining feature and the one that lets you adjust instead of giving up. It needs the Plan view so a confirmed change has somewhere to show.
  PRD ref: `prd.md > Talk to Team`
  Spec ref: `spec.md > Components > Talk to Team`, `spec.md > Components > Team Brains`, `spec.md > Data Model` (`plan_proposals`)
  Build: Add `lib/ai/router.ts` (pick the teammate, handoff §7.6), the team chat screen (§6.9), the join notice, the teammate picker, `plan_proposals`, the proposal card (§4.6), and confirm or decline. Confirm is the only code that applies a proposal to tasks.
  Verify (mechanical): `npm run build` passes. A script sends "this task is too big," "I'm tired" and "why am I doing this" and checks they route to Georgina, Sarah and Alice. It checks a pending proposal changes no task, declining changes no task, and confirming changes exactly the tasks listed.
  Learner check: Tell the team a task is too big. Decline the first proposal and check Plan is unchanged. Ask again, confirm, and check Plan. Then pick Sarah and ask her about the plan. Say whether the handover felt natural.
  Commit: `Add Talk to Team with confirmed plan changes`

- [ ] **11. Finishing a milestone completes a stage, and Georgina plans the next two weeks**
  Becomes usable: When a milestone is done, the house gets a "Stage n complete" stamp and a line from Paula. When the planned two weeks run out, Georgina writes the next 14 tasks from what you did and missed, and may bring back earlier practice as a task tagged "Mastery."
  Why now: Without it the app stops after 14 days. It comes after the core is submittable because nobody reaches day 15 during the hackathon, so it is proven with test data.
  PRD ref: `prd.md > Roadmap and 2-Week Chunks` (next chunk), `prd.md > Mastery Tasks (Refreshers)`, `prd.md > Progress: The House` (stage celebration), `prd.md > Weekly Target, Streak, and Celebration` (milestone before weekly)
  Spec ref: `spec.md > Components > Plan Builder` (next chunk), `spec.md > Components > Plan Keeper (roll-forward)`, `spec.md > Components > Weekly Target, Streak and Celebrations`
  Build: Add next-chunk generation to `lib/ai/plan.ts` with the same shape checks, started by `bringPlanUpToDate` when planned tasks run out. Add stage completion to `completeTask`, the stage stamp and Paula's line (handoff §6.11), and the "Mastery" tag using the existing label style.
  Verify (mechanical): `npm run build` passes. A script completes every task of a test milestone and checks a stage celebration is returned and the milestone is done. When that same task also hits the weekly target, both are returned with the stage first. With no planned tasks left, a next chunk of 14 valid tasks is saved and `planned_through` moves on.
  Learner check: On a test account prepared one task short of a milestone, mark the task done and watch the stamp. Open Plan and read the next two weeks. Say whether the new tasks follow on from the old ones.
  Commit: `Add stage celebrations, next-chunk planning and mastery tasks`

- [ ] **12. You can abandon a project, with a clear warning first**
  Becomes usable: Profile shows your current goal with "Change goal." The warning lists what is deleted forever and what you keep, suggests talking to the team first, and makes "Keep building" the main button. Only "Yes, I want to abandon this project" deletes it, and you are back on the empty lot with your houses-built count intact.
  Why now: It is the only way to start over, which matters as soon as other people try the app, and it must be built after every table that hangs off a project exists so the delete can be checked against all of them.
  PRD ref: `prd.md > Sign Up and Profile` (abandon criteria)
  Spec ref: `spec.md > Components > Accounts and Profile`, `spec.md > Data Model` (abandoning a project)
  Build: Add the abandon dialog (handoff §7.5, §4.8), the one place besides the ribbon where red is used. Confirm the cascade in the migrations, delete the project, and remove its photos from storage.
  Verify (mechanical): `npm run build` passes. A script abandons a test project that has tasks, proofs, a photo, chats and a proposal, then checks no row or file tied to it remains and the profile, `houses_built`, week records and dream are unchanged.
  Learner check: On a second test account, abandon the project. Read the warning as if it were your real illustration goal. Say whether it is clear enough about what you lose.
  Commit: `Add the abandon flow`

- [ ] **13. The scaffolding comes down, you cut the ribbon, and you start your next house**
  Becomes usable: When the last task of the last milestone is done, the finished house is revealed and waits for you to cut the ribbon. Your houses-built count goes up by one, and you are offered a next house.
  Why now: It is the ending the name promises. It sits late because it can only be reached with test data during the hackathon and nothing else depends on it.
  PRD ref: `prd.md > Progress: The House` (house complete, next house)
  Spec ref: `spec.md > Components > House and Progress`, `spec.md > Data Model` (completing a house)
  Build: Add house completion to `completeTask` (project complete, `houses_built` plus one), the finished state of the house, and the ribbon-cutting ceremony (handoff §6.11) that never cuts on its own, with a reduced-motion version. Offer a new goal with Alice afterward.
  Verify (mechanical): `npm run build` passes. A script completes the final task of a test project and checks the project is complete, `houses_built` rose by exactly one, a house celebration is owed, and running it again does not add a second house.
  Learner check: On a test account prepared one task from the end, mark it done and cut the ribbon. Say whether the moment feels earned.
  Commit: `Add the house-complete ceremony`

- [ ] **14. Alice helps you find a goal, and a big dream becomes a path of houses**
  Becomes usable: Before a goal exists, Talk to Team is a chat with Alice. Name an interest and she offers three goal ideas. Name a big dream and Georgina joins to break it into a path of smaller goals. "Design this goal with Alice" opens onboarding with the Wish filled in, and Home and Progress show "House n of m."
  Why now: It serves people who arrive without a goal. The first user arrives with one, so every earlier step works without it, and it is the safest piece to drop if the deadline gets close.
  PRD ref: `prd.md > Finding a Goal, Dreams, and Paths`
  Spec ref: `spec.md > Components > Goal Finder, Dreams and Paths`, `spec.md > Components > Plan Builder` (path), `spec.md > Data Model` (`dreams`, `path_steps`)
  Build: Add the `dreams` and `path_steps` tables, the goal-finder chat (handoff §6.3), path generation in `lib/ai/plan.ts`, the hand-off into onboarding, "House n of m" on Home and Progress, and offering the next path step after a house is complete. The dream survives abandoning its current house.
  Verify (mechanical): `npm run build` passes. A script gives an interest and checks three goal ideas come back, gives a dream and checks an ordered path is saved with one current step, starts onboarding from a path step and checks the Wish is filled in, and abandons that project and checks the dream remains.
  Learner check: On a fresh account, tell Alice a big dream of your own. Read the path. Say whether the first step is small enough to start this week.
  Commit: `Add goal finder, dreams and paths`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 1, the look and the menu on your own phone, before any screen is built on top of them
- [ ] Core journey explored end to end — after slice 6, from sign-up to the WhatsApp nudge on the live link (the first submittable version)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

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

