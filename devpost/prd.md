---
doc: prd
status: approved
---

# Scaffold — Product Requirements

You're the builder, and you have a team behind you. Scaffold's AI build team (Alice the Architect, Georgina the General Contractor, Paula the Project Manager, Sarah the Site Lead) turns your dream into one small task a day, nudges you on WhatsApp, collects your proof, and shows how far you've come. For anyone who enjoys something and wants to get better at it but struggles to stay consistent without clear, assigned tasks. First real user: the learner, becoming a better illustrator.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

> **Scope change:** `scope.md` described a small proof of concept. During `3-prd` the learner chose to build a full-featured product using the 25-day submission window (deadline Oct 26, 2026). Several items `scope.md > Later` and `scope.md > Explicitly Cut` listed are now in. See **Product Decisions**.

> **Design handoff (Oct 8, 2026):** the learner designed the product's look and behavior ("Blueprint" direction). The full detail lives in `SCAFFOLD_DESIGN_HANDOFF.md` in the project root: colors, type, components, every screen and its final wording. This PRD says *what* Scaffold does; the handoff says *how it looks and responds*. The decisions made during design are folded in below and marked *(design handoff §n)*.

## The Core Journey
Develops `scope.md > The Core Loop`.

1. **Sign up.** Create an account with email and WhatsApp number.
2. **Welcome and onboarding.** **Alice the Architect** welcomes you, then asks three questions to build your profile: what to call you, when your daily WhatsApp message should arrive, and how many days a week you want to build. Not sure what to build yet? Alice helps you find a goal first (see **Finding a Goal, Dreams, and Paths**).
3. **Set your first goal through a WOOP conversation with Alice the Architect.** A back-and-forth chat, one step at a time:
   - **Wish:** what you want to accomplish (e.g. "become a better illustrator"). Alice then asks whether you've done any of this before, so tasks start at the right level.
   - **Outcome:** the best result if you achieve it. This is your *why*, saved and reused in reminders.
   - **Obstacle:** the main thing *inside you* that gets in the way (e.g. "I scroll instead of drawing").
   - If the obstacle involves your phone, the Architect suggests setting a limit with your phone's own Screen Time settings.
4. **Georgina the General Contractor builds your plan.** AI builds (a) a **roadmap of big milestones** toward the wish and (b) **daily tasks for the first 2 weeks**. Each task takes 20 minutes or less. The plan includes if–then responses to your obstacle (the "P" in WOOP).
5. **Commit.** You review the plan and commit to it. The process is now in play.
6. **Every day: get nudged by Sarah the Site Lead.** One WhatsApp message with a motivational line and today's task.
7. **Do the task.** One small, clear task. Afterward you can keep going or stop until tomorrow.
8. **Mark it done.** In the app or by replying on WhatsApp. "Mark as done" is the official record. A note ("today I achieved…") or photo is optional and can be added or edited any time later. You're on your honor.
9. **See progress: your house going up.** Every completed task adds a brick. Every milestone completes a construction stage, with a celebration.
10. **Every 2 weeks: the next chunk.** The General Contractor generates the next 2 weeks of tasks toward the current milestone, informed by how the last chunk went.
11. **Talk to Team anytime.** Chat about how it's going, get motivated, talk about how you feel, or change the plan. The team decides who answers, or you pick a teammate. The plan only changes after you confirm.

Success is the user's experience at the end: *feeling capable of setting, sticking to, and accomplishing a goal, and wanting to accomplish more.* Never overwhelmed, never guilted.

## Screens and Layout
The learner's menu structure:

| Menu | What's there |
|---|---|
| **Home** | The overall goal and today's task, with a way to mark it done (note or photo). |
| **Progress** | Your house under construction (the main image), the roadmap, and your weekly target and streak. |
| **Plan** | The plan (past, present, future), browsable a week at a time or by a chosen time frame, never all at once, plus the learning log. |
| **Talk to Team** | Chat with your build team. The team decides who answers, or you pick a teammate, who can bring in colleagues. Before a goal exists, this is the goal-finder chat with Alice. |
| **Profile** | Current goal (changeable, with a warning), weekly target setting, daily nudge time, contact details, houses built. |

Before these: **Sign up**. The **Onboarding / WOOP** conversation and the **plan review** happen on first use, but nothing is locked: every menu works before a goal exists and shows a friendly empty state pointing to Alice. *(design handoff §3.3, §7.7)*

Every screen works on both phone and desktop. On desktop the menu is a left sidebar; on a phone it's a bottom tab bar with Profile in the top bar. *(design handoff §3)*

## Look and Feel
Direction: **"Blueprint."** Full detail in `SCAFFOLD_DESIGN_HANDOFF.md` §2–§5 and §9. In short:
- **Theme: building a house.** You're the builder, and the team is behind you. The house is the main visual, drawn on blueprint grid paper.
- **Colors:** navy for structure, yellow for highlights only (today, scaffolding, celebrations), on a light grey-blue background. **Red appears in exactly two places:** the abandon confirmation and the ribbon in the house-complete ceremony. Never for missed tasks or anything the user did "wrong."
- **Typography:** Space Grotesk for headings, IBM Plex Sans for everything else.
- **Teammates** have names and a small initial badge (A, G, P, S) but **no illustrations**, always labeled "Name · Role."
- **Tone:** gentle, encouraging teammates, never a drill sergeant. Short sentences. Simple, never overwhelming. (`scope.md > Inspiration & Identity`)
- **References:** Duolingo (clear daily lessons, reminders, streaks, celebration) and Khan Academy (a ready-made path that feels less intimidating).
- **Celebrations:** confetti for the weekly target, a "stage complete" stamp for a milestone, and a ribbon-cutting when the house is finished. Animations are skipped for people who've asked their device to reduce motion.
- **Accessible by design:** readable contrast, large tap targets, and status never shown by color alone. *(design handoff §8)*
- Light mode only for now.

## Features and Behavior

### Sign Up and Profile
- As a new user, I want to create an account so my goal and progress are mine and others can use Scaffold too.
  - [ ] I can sign up with my email and WhatsApp number, and log back in later to the same goal and progress.
  - [ ] Profile shows my current goal, my weekly target (1–7 days), the time my daily nudge arrives, and my contact details, all editable.
  - [ ] Changing my goal means **abandoning the current project**. I see a warning listing what is deleted forever and what I keep, and must explicitly confirm ("Yes, I want to abandon this project") before the old goal is replaced. "Keep building" is the main button.
  - [ ] Abandoning **deletes everything tied to that project**: the house and its bricks, the goal and WOOP answers, the roadmap and plan, the learning log (all notes and photos), and team chats about the goal. I keep my account, settings, and houses-built count. *(design handoff §7.5)*
  - [ ] The warning suggests talking to the team first: "Sometimes the goal is right and only the plan needs adjusting."
  - [ ] My lifetime count of **completed** houses is never affected by abandoning a project. It only ever goes up.
- One active goal at a time.

### Onboarding and WOOP Goal Setting
Develops `scope.md > The Core Loop` step 1.
- As someone starting something new, I want to set my goal through a conversation so it feels like a conversation, not filling in a form.
  - [ ] Onboarding opens with a welcome, then three profile questions (my name, when the daily WhatsApp message should arrive, how many days a week I want to build), then the WOOP conversation. *(design handoff §6.4)*
  - [ ] The Architect asks Wish, Outcome, Obstacle in order, one at a time, as chat messages. Each has quick-reply suggestions, and I can always type my own answer.
  - [ ] After my Wish, the Architect asks about my **prior experience**, so the plan starts from where I am now.
  - [ ] A step bar (You → Wish → Outcome → Obstacle → Plan) shows where I am.
  - [ ] **My progress is saved after every answer.** If I leave partway, Home welcomes me back and offers "Continue where you left off," reopening at the saved step.
  - [ ] A vague obstacle (e.g. "life gets busy") gets a gentle follow-up asking for something more specific.
  - [ ] If the obstacle involves phone use, the Architect suggests setting a Screen Time limit on my phone. Scaffold doesn't check whether I did.
  - [ ] My Outcome (my *why*) is saved and appears later in nudges and re-engagement messages.

### Finding a Goal, Dreams, and Paths
New during design. Develops `scope.md > Later` ("help planning brand-new goals from scratch"). *(design handoff §6.3, §7.4)*
- As someone who isn't sure what to build, I want help finding a goal so I don't get stuck before I start.
  - [ ] Before a goal exists, Talk to Team is a chat with Alice that helps me find one. I can name an interest, name a big dream, or say I already know my goal.
  - [ ] For an interest, Alice offers three goal ideas. I pick one or type my own.
  - [ ] For a **big dream** (e.g. "build a house," "illustrate my own picture book"), Georgina joins, asks about my experience, and breaks the dream into a **path** of smaller goals. The path starts at my real level, and each step can be finished in weeks, not years.
  - [ ] The chat ends with "Design this goal with Alice," which opens onboarding with the goal already filled in.
  - [ ] **Each goal on the path is its own house.** With a dream, Home and Progress show "House [n] of [m] toward [dream]." Without one, the path isn't shown.
  - [ ] When I finish a house, I'm offered the next one on my path, or I can choose something else.
- One optional dream at a time. Goal ideas and paths are written by the AI for each person, not picked from a fixed list.
: Roadmap and 2-Week Chunks
- As a user, I want to see the path to my dream without being overwhelmed by every future day.
  - [ ] After WOOP, the General Contractor shows a roadmap of **five milestones** plus 2 weeks of daily tasks. I see my Wish, Outcome, and Obstacle alongside it, and can ask for changes or commit with "I commit to this plan." *(design handoff §6.5)*
  - [ ] Each daily task is one clear, finishable exercise sized at **20 minutes or less** (e.g. "draw 6 hands, 3 minutes each," which is 18 minutes).
  - [ ] The plan includes at least one if–then response to my named obstacle.
  - [ ] Only the current 2 weeks are broken into daily tasks. Later milestones show as roadmap steps.
  - [ ] When a 2-week chunk ends, the next chunk is generated toward the current milestone.
  - [ ] Every task can explain itself. See **Why This Task**.
- **Plan view:** past, present, and future steps, viewed a week at a time or by a time frame I pick from a dropdown (last week, this week, next week, this milestone). Never the whole plan at once. **Weeks start on Monday.** Completed tasks show what I did. *(design handoff §6.8)*
  - [ ] Each task shows as done, today, missed, or upcoming. A missed task reads "Not done. Moved to the next day, and the plan shifted with it," with no red and no blame.
  - [ ] Where the planned 2 weeks end, I see when Georgina will plan the next 2.

### Daily Task and Marking Done
Develops `scope.md > The Core Loop` steps 3–4.
- As a user, I want one clear task a day so I either did it or I didn't.
  - [ ] Home shows my goal and today's task.
  - [ ] I can mark the task done, with an optional note and/or photo.
  - [ ] **"Mark as done" alone is the official record.** Proof is never required. I can add or edit a note or photo any time later from Plan, and doing so never changes when the task was done, my target, or my streak. *(design handoff §7.1)*
  - [ ] Home also shows my house, this week's days, my if–then plan with my why, and today's line from Sarah. *(design handoff §6.6)*
  - [ ] Once it's done, Home shows it as complete. I can keep working or stop for the day. *(This screen isn't designed yet. See Open Questions.)*
  - [ ] **A missed task rolls forward:** tomorrow I get the same task and the plan shifts by one day. ("No progress without action.")

### WhatsApp Nudges and Replies
Develops `scope.md > The Core Loop` step 2. Two-way replies were cut in scope and are now in.
- As a user, I want the nudge to reach me where I already am.
  - [ ] Once a day I get one WhatsApp message: a motivational line plus today's task.
  - [ ] I can reply on WhatsApp to mark the task done, with a photo or a statement ("today I achieved…") as proof.
  - [ ] A WhatsApp reply marks the task done in the app, and the proof appears in the learning log.

### Missed Days and Re-engagement
The no-guilt sequence, in the learner's design:

| When | What happens |
|---|---|
| Day 1 missed | Normal WhatsApp nudge, gentle about yesterday. |
| Day 2 missed | Smaller and warmer: "just 5 minutes today?" |
| Day 3 missed | Sarah the Site Lead invites a chat with the team to adjust the plan. |
| After day 3 | Daily nudges stop. |
| Start of next week, still no task done | A sincere **email** reminding me why I started (my Outcome). |
| Start of the following week, still no task done | A final **WhatsApp voice note** from the team. |
| Then | Silence. |
| Any task completed | Everything resets: daily nudges resume. |

- "Activity" means **completing a task**. Opening the app or chatting doesn't count.
  - [ ] No nudges are sent after day 3 of inactivity.
  - [ ] The email and voice note are sent only if no task has been completed since the nudges stopped.
  - [ ] Completing any task restarts daily nudges the next day.

### Weekly Target, Streak, and Celebration
- As a user, I want room for real life without losing my progress.
  - [ ] I set a weekly target (1–7 days per week) during onboarding and can change it in Profile. **Changes apply right away, including the current week.**
  - [ ] When I hit it, the screen shows confetti and "Congratulations, you hit your weekly target!"
  - [ ] A week with some tasks done but below target gets no message.
  - [ ] The streak counts consecutive weeks where the target was hit.
  - [ ] **Celebrations only ever come from marking a task done.** Changing a setting never triggers one. If I lower my target to or below the days I've already done, the celebration (and that week's streak credit) comes with the next task I mark done that week. *(design handoff §7.2, §7.3)*
  - [ ] If one task both finishes a stage and hits my weekly target, I see the milestone celebration first and the weekly one after I close it. Never two at once.

### Levels and Rewards
**The bricks and stages are the levels and rewards.** Nothing separate is built. Each completed task earns a brick, each milestone completes a stage with a celebration, hitting the weekly target earns confetti and a streak, and a finished house adds to the houses-built count. See **Progress: The House** and **Weekly Target, Streak, and Celebration**.

### Progress: The House
- As a user, I want to see my dream literally being built so I acknowledge, "yes, I have progressed a lot!"
  - [ ] Progress shows my house under construction as the main image, with the roadmap and my weekly target/streak.
  - [ ] **Brick by brick:** each completed task visibly adds to the house.
  - [ ] **Five construction stages, one per roadmap milestone:** Groundwork → Foundation → Walls → Roof → Finishing. Completing a milestone completes a stage.
  - [ ] The house shows finished stages, the current stage partly built, and what's still to come as dashed outlines, with scaffolding up while I'm building.
  - [ ] Completing a milestone triggers a celebration on screen: a "Stage [n] complete" stamp on the house, and a line from Paula about what's next.
  - [ ] **House complete (goal reached):** the scaffolding comes down, the finished house is revealed, and I cut the ribbon myself. It never cuts on its own. My houses-built count goes up by one. *(design handoff §6.11)*
  - [ ] I can then start a next house: the next goal on my path if I have a dream, or a new goal with the Architect.
  - [ ] Progress shows how many houses I've built over my lifetime.

### Learning Log
Develops `scope.md > Later` ("a log of what you learned from each task").
- [ ] Each completed task's note and/or photo is saved to the learning log, viewable in Plan as its own tab, newest first.
- [ ] I can add a note or photo to any finished task, any time, from the Tasks tab.
- [ ] With no entries yet, it says "Nothing here yet. Entries appear after you finish a task and add a note or photo."

### Why This Task
Develops `scope.md > Later` ("real, cited sources behind tasks and suggestions"). Replaces the earlier "cited sources" idea.
- As a user, I want to know what a task is based on, so I trust it's good advice. For a task like "draw 6 hands, 3 minutes each," the learner asked of an earlier version: "why 10 and why 3. What is it based on."
  - [ ] Next to a task there is a small **?**. The explanation appears only when I ask for it, never by default.
  - [ ] Opening it shows Georgina's short explanation of the task, including why its numbers are what they are (why 6, why 3 minutes).
  - [ ] On desktop it opens on hover or keyboard focus. On a phone, where there is no hover, it opens on tap. *(Assumption, to confirm.)*
  - [ ] Georgina explains in her own words. She does not claim something is "proven" or name a book or study unless it is real. *(Assumption, to confirm: an AI can invent sources that sound real, and "bad advice is worse than no advice at all.")*

### Mastery Tasks (Refreshers)
Develops `scope.md > Later` ("refreshers that bring back things you learned earlier"). Called **mastery** in the app.
- As a user, I want things I learned earlier to come back so I keep the skill, not just tick it off.
  - [ ] A mastery task appears like any other daily task: on Home, in Plan, and in the WhatsApp nudge. Same size (20 minutes or less), same "Mark as done," same brick.
  - [ ] It is labeled "Mastery" so I can tell it revisits something I've already practiced.
  - [ ] Georgina decides when to include one as she plans each 2-week chunk. There is no fixed schedule.

### Talk to Team
Includes the follow-up conversation from `scope.md > Later`.
- As a user, I want my team to talk to about how it's going, so I adjust instead of giving up.
  - [ ] By default the team decides: the teammate whose role fits the topic answers, labeled "Name · Role." Plan changes or a task that's too big → Georgina. Feelings, motivation, tiredness → Sarah. The goal or my why → Alice. Progress → Paula. Unclear → Paula. *(design handoff §7.6)*
  - [ ] **I can also pick a teammate.** They answer first, and if the topic belongs to someone else they hand over ("Let me bring in Georgina, she handles the plan"). Several teammates can be in one conversation.
  - [ ] I can chat about progress, get motivation, or talk about how I'm feeling.
  - [ ] A teammate can propose changes to the plan, shown as a card with the old task and the new one side by side. **No change is applied until I confirm.** I can also decline, and my plan stays exactly as it was.
  - [ ] Confirmed changes appear in the Plan view.

## States and Boundaries
- **First use:** sign-up → welcome → profile questions → WOOP → plan → commit. **Nothing is locked.** Before a goal is committed, Home shows an empty lot ("Every dream house starts with a plan"), Progress and Plan show empty states, and Talk to Team is the goal-finder chat. All of them point to Alice. *(design handoff §6.1–6.3)*
- **Onboarding left unfinished:** progress is saved after every answer. Home offers "Continue where you left off."
- **Normal use:** Home shows today's task. One nudge a day.
- **Task done:** shown as complete. Proof saved to the log.
- **Missed days:** task rolls forward. Re-engagement sequence as above.
- **Weekly target hit:** confetti. **Missed partially:** nothing.
- **Milestone and weekly target on the same task:** milestone celebration first, then weekly. Never stacked.
- **Abandoning a project (changing goal):** explicit consent ("Yes, I want to abandon this project"), then everything tied to that project is deleted, including the learning log and team chats. Account, settings, and completed-house count stay.
- **Persists:** account, goal, WOOP answers, plan, completed tasks and proof, weekly target.
- **Honesty:** completion is self-reported. The app doesn't verify proof.

## Product Decisions
- **Finishing a dream:** the scaffolding comes down to reveal the house (the name's meaning made visible), with a celebration. Then you start your next house, and a lifetime count of houses built is kept.
- **Progress is a house under construction.** Brick by brick: each task adds a brick, and each milestone completes a stage (ground-breaking → foundation → frame → brick…) with a celebration. It replaces the earlier "where you started → where you're going" comparison, which is dropped. Proof photos and notes still live in the learning log.
- **A build team, not a single friend.** The user is the builder, with a team behind them: **Architect** (welcome and WOOP), **General Contractor** (building the plan), **Project Manager** (during the project: progress and adjustments), **Site Lead** (daily WhatsApp messages). No Inspector. **Names:** Alice the Architect, Georgina the General Contractor, Paula the Project Manager, Sarah the Site Lead (alliterative, easy to remember). Named, but not illustrated: the house is the main visual. "Site Lead" instead of the gendered "Foreman." They're called *teammates*, not friends, because each has a defined role and a shared goal: helping you build something. Like Duolingo's cast of characters.
- **"Talk to Team" replaces "Help."** The app brings in the right teammate(s) based on the conversation. *Changed during design:* the team still decides by default, but the user **can** pick a teammate, who can bring in colleagues. (Earlier: "the user doesn't pick.")
- **Look and feel: "Blueprint."** Navy and yellow on blueprint grid paper, with red reserved for the abandon warning and the opening ribbon, so a missed task never looks like a failure.
- **The app is never locked.** Every menu works before a goal exists and points to Alice. (Replaces the earlier assumption that everything is locked until a goal is committed.)
- **Help finding a goal is in.** Moved from deferred into the build: Alice helps find a goal, and a big dream is broken into a path of smaller goals, each its own house.
- **Five fixed house stages:** Groundwork → Foundation → Walls → Roof → Finishing, one per milestone. ("Frame/skeleton" dropped.)
- **"Mark as done" is the record; proof is optional and can come later.** Notes and photos can be added or edited any time without affecting targets or streaks.
- **Weekly target changes apply immediately, but only marking a task done can trigger a celebration.** Lowering a target should never set off confetti on its own.
- **Milestone before weekly** when one task earns both.
- **Abandoning deletes everything tied to the project,** including the learning log and team chats, and the warning says so plainly.
- **Onboarding asks name, nudge time, and days per week, then prior experience after the Wish.**
- **Weeks start on Monday. Nudge time is chosen by the user.**
- **Tasks are 20 minutes or less.** Raised from 5–15 minutes by the learner at review. The design handoff still says 5–15 in places (§1, §6.4, §7.8, §10); this PRD is newer on that point.
- **"Why this task" on request, instead of cited sources.** Georgina explains a task and its numbers only when asked, through a **?** next to the task. It keeps the daily task simple and still answers "what is it based on."
- **Refreshers are ordinary tasks called "mastery."** No new screen or separate system: a mastery task looks and works like any other daily task.
- **No separate levels or rewards.** The bricks and stages already are the levels and rewards, so a second system would only add clutter.
- **Screens before WhatsApp in the build.** "The WhatsApp nudge isn't valuable without the rest": a nudge needs a real task, plan, and house behind it. This reverses the earlier order, which had the nudge in the core build.
- **Name: Scaffold** (replaces the working title "Dream Friend"). "Dream Friend" made the friend sound like the dream. Scaffold centers the accomplishment with support behind it: the house is your dream, the daily tasks are bricks, and the scaffolding is the support system. As in teaching, scaffolding is temporary support that comes down once you can build on your own.
- **Full-featured, not a minimal POC.** The learner has 25 days and wants an ambitious, complete product. *Safeguard:* the build does the core features first, so a working, submittable version exists early (see **What We're Building**).
- **WOOP replaces "goal, why, time."** Wish = goal, Outcome = why, and Obstacle targets the real problem: "I stop working on it." The 20-minutes-or-less task size replaces the "how much time do you have" question.
- **AI creates the plan, the user commits to it.** Commitment is an explicit step.
- **Roadmap + 2-week chunks.** Chosen over a whole plan (goes stale, overwhelming, wasted generation) and over chunks alone (lose sight of the end goal).
- **Plan view shows one week or a chosen time frame, never everything.** The whole plan at once is "ugly and overwhelming."
- **Note or photo with each done task.** It holds me accountable for what I claim and is "great motivation later."
- **Sign-up is in,** so others can use it (`scope.md > Who It's For`).
- **Two-way WhatsApp is in,** for replying with proof.
- **A missed task rolls forward,** because "there is no progress without action."
- **Weekly target instead of a daily streak,** set by the user, with a celebration when hit. It leaves room for life without guilt.
- **No nudges after 3 missed days,** to avoid nagging. Re-engagement then escalates gently: email, then voice note, then silence.
- **Daily nudge on WhatsApp, not email.** Briefly switched to email for cost, then moved back. WhatsApp better fits the kernel ("the nudge finds you") and the judging criteria (innovation, presentation, impact). Cost at hackathon scale is cents.
- **App tracking (e.g. noticing Instagram use) replaced by a Screen Time suggestion.** Tracking would require a native phone app and could feel like surveillance.
- **The team changes the plan only after confirmation.** The user stays in control.
- **One goal at a time.** Changing it warns that all progress will be lost.

## What We're Building

**Screens first, then WhatsApp.** Decided by the learner: "the WhatsApp nudge isn't valuable without the rest." The order follows the design handoff §11.

**Core first.** This builds the first working, submittable version:
1. Foundations: the look (colors, type), the menu, and shared pieces like buttons and cards
2. Sign up and log in
3. Home before a goal, and the other empty states
4. Onboarding + WOOP conversation, saved as you go
5. AI roadmap + first 2-week plan, review, and commit
6. Home: goal, today's task, mark done with note/photo
7. Progress: the house growing brick by brick, roadmap position, weekly target
8. Weekly target celebration (confetti)

**Then layered on**, one at a time:
9. Plan view (by week / time frame), learning log, and missed tasks rolling forward
10. Talk to Team chat with confirmed plan changes
11. Profile and the abandon flow
12. Milestone and house-complete celebrations
13. Next 2-week chunk generation
14. Goal-finder chat, dreams, and paths
15. Daily WhatsApp nudge
16. Two-way WhatsApp: replying with proof
17. Missed-day nudges and re-engagement: sincere email, final voice note
18. Mastery tasks (refreshers)
19. "Why this task" explanations (the **?** next to a task)

*Where steps 13, 18, and 19 sit is a proposal: the handoff's order doesn't mention them.*

## Deferred From the Build
- **Adjusting tasks to how you feel that day** (automatic): not chosen. Feelings can still come up in Talk to Team.
- **Dark mode:** light only for now.

## Possible Later Enhancements
- "Where you started → where you're going" (day 1 vs. day 20 proof comparison): dropped in favor of the house, but the saved proof would make it possible later.
- Email as a cheaper daily-nudge fallback at large scale.
- Links to real, checkable sources (books, courses, studies) behind each "why this task."
- Multiple goals at once.

## Non-Goals
- **Tracking other apps' usage** (Instagram etc.): needs a native app and special permissions, and feels like surveillance. Replaced by the Screen Time suggestion.
- **Verifying proof:** honesty-based by design.
- **Guilt or punishment mechanics:** no reset-to-zero shaming, no nagging after day 3.

## Open Questions
**Answered by the design handoff:** look and feel ("Blueprint"), onboarding profile questions, streak definition, week start day and nudge time, whether the app is locked before a goal (it isn't), and house stages (five, fixed names).

**Answered in the PRD interview (Oct 8, 2026):** build order (screens first), levels and rewards (the bricks and stages), refreshers (mastery tasks), and cited sources (a "why this task" explanation on request).

Must answer before `4-spec`: none left.

Can be confirmed at review:
- **Why this task:** tap on a phone instead of hover? And should Georgina avoid "proven" claims and named sources unless they're real? (Both assumed yes.) The **?** isn't in the design handoff yet.
- **Mastery tasks:** does the "Mastery" label need a design? (Assumed: a status tag like "TODAY'S BRICK.")
5. **Voice note timing:** one week after the email? (Assumed yes.)
6. **Open design questions** (`SCAFFOLD_DESIGN_HANDOFF.md` §13, each with the designer's recommendation):
   - Is the dream named separately, or can a big Outcome become the dream? (Recommended: optional; Alice may suggest it.)
   - Does the dream survive when its current house is abandoned? (Recommended: yes.)
   - Should "Start over" in onboarding ask for confirmation? (Recommended: yes, lightly.)
   - Does "Ask for changes" on the plan review go to Alice or Georgina? (Recommended: Georgina.)
   - Does Talk to Team keep its full history or start fresh each day? (Recommended: keep.)
   - Do missed days stay visible in Plan? (Recommended: yes.)
   - A small "ground-breaking" moment after committing? (Recommended: optional, no confetti.)
   - When the weekly target is hit by a WhatsApp reply, where does the celebration show? (Recommended: next app visit, plus a line in Sarah's reply.)
7. **Not designed yet:** Home after today's task is done, Profile before a goal exists, sign-up and log-in screens, and the wording of WhatsApp messages, the re-engagement email, and the voice note.
