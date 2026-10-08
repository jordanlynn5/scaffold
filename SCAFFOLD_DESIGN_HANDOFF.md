# Scaffold — Design Handoff

**Version:** 1.0 · 8 October 2026
**Design direction:** "Blueprint"
**Audience:** the developer building Scaffold, and Claude Code working alongside them.

This document is the single source of truth for how Scaffold looks and behaves. It complements the PRD (`prd.md`): the PRD says *what* the product does, and this file says *how it looks, how it responds, and the rules decided during design*. Where the two disagree, **this file is newer** (see §12, "Changes to the PRD").

---

## 0. How to use this document

**For the developer**

1. Put this file in the repository root as `DESIGN.md`, next to `prd.md`.
2. Add one line to the project's `CLAUDE.md` so Claude Code always reads it:
   > Before building or changing any UI, read `DESIGN.md`. Follow its tokens, components and rules exactly. If something is not covered, ask instead of inventing.
3. Build in the order in §11. Each screen in §6 lists its states, so build and check them one at a time.
4. **Visual reference:** the full clickable design canvas is published at `https://claude.ai/artifact/U156q1K47JmEvS3GTtKkus`. It is private until the owner shares it from the canvas's **Share** menu. Use **Play** on any artboard to click through it.

**For Claude Code**

- Use the tokens in §2 by name. Never hard-code a color or size that isn't listed.
- Every screen must work at both phone and desktop widths (§3). Check both before calling a screen done.
- Sample content in this document (illustration tasks, "Alex", dates) is **example data only**. Real content comes from the user and the AI teammates.
- Things marked **[OPEN]** are undecided. Don't guess; leave a clearly marked placeholder and list it in your summary.

---

## 1. Product in one minute

Scaffold helps someone stick to a goal by turning it into **one small task a day** (5–15 minutes). The metaphor is **building a house**:

| Term | Meaning |
|---|---|
| **House** | One goal. A user builds one house at a time. |
| **Brick** | One completed task. Every task marked done adds a brick. |
| **Stage** | One roadmap milestone. Each house has 5 stages: Groundwork → Foundation → Walls → Roof → Finishing. |
| **Scaffolding** | The support system (the team). It comes down when the house is complete. |
| **Lot** | The empty space before a goal exists. |
| **Dream** | An optional big ambition above the houses, e.g. "Build a house" or "Illustrate my own picture book". |
| **Path** | The ordered list of houses (goals) leading to a dream. Each step is its own house. |
| **Houses built** | Lifetime count of completed houses. Never decreases. |

**The build team.** Four AI teammates with names and roles but **no illustrations**:

| Teammate | Role | Responsible for |
|---|---|---|
| **Alice** | Architect | Welcome, onboarding, WOOP goal design, helping find a goal, the user's *why* |
| **Georgina** | General Contractor | Roadmap, daily tasks, breaking dreams into paths, plan changes |
| **Paula** | Project Manager | Progress, check-ins, bringing in the right teammate |
| **Sarah** | Site Lead | Daily WhatsApp nudge, motivation, feelings |

---

## 2. Design tokens

Use these exact values. They're written as CSS custom properties so they work with any stack. Map them into Tailwind, CSS-in-JS or a native theme as needed, keeping the names.

### 2.1 Colors

```css
:root {
  /* Core */
  --color-navy:            #1F3A5F; /* structure: sidebar, primary buttons, current-stage bricks, teammate badges */
  --color-ink:             #14202E; /* main text, dark cards */
  --color-yellow:          #F2B705; /* highlights only: active nav, scaffolding, today, celebrations. Never text on white */
  --color-bg:              #F4F6F9; /* page background, quiet inner boxes */
  --color-surface:         #FFFFFF; /* cards, dialogs, team chat bubbles */

  /* Text */
  --color-text-secondary:  #3A4A5E; /* body text under headings */
  --color-text-muted:      #4A5A6E; /* dates, captions, labels (lightest allowed text grey) */
  --color-text-on-navy:    #DCE4EE; /* inactive nav items, text on navy */

  /* Lines and fills */
  --color-line:            #D5DDE7; /* card borders, dividers */
  --color-input-border:    #C2CDDA; /* inputs, secondary button outlines, dashed "not yet" borders */
  --color-track:           #E6ECF3; /* empty progress tracks, inactive segments, neutral chips */
  --color-grid:            #E9EEF4; /* blueprint grid-paper lines */
  --color-dash:            #9AABBF; /* dashed outlines of things still to build */
  --color-ground:          #C9D3DF; /* ground line under houses */
  --color-slate:           #7D8CA0; /* bricks of finished stages */
  --color-sky:             #8FB3E0; /* windows on the finished house */

  /* Yellow family */
  --color-yellow-tint:     #FFF4CC; /* badges, dream house fill */
  --color-yellow-wash:     #FFFBEB; /* "current item" card background, today's row */
  --color-yellow-text:     #6B4E00; /* text on yellow tint/wash */

  /* Red: reserved, see rule below */
  --color-danger:          #B42318; /* ONLY the abandon confirmation button + warning icon */
  --color-danger-tint:     #FDECEA; /* ONLY the "Deleted forever" box */
  --color-danger-text:     #8E1C12; /* text inside the danger tint */
  --color-ribbon:          #D63B3B; /* ONLY the ribbon in the house-complete ceremony */
  --color-ribbon-dark:     #A82A2A; /* ribbon shadow/outline */
  --color-confetti-accent: #E4572E; /* one of the confetti colors */

  /* Overlay */
  --color-scrim:           rgba(20, 32, 46, 0.6); /* behind dialogs */
}
```

**Color rules**

- **Red appears in exactly two places:** the abandon flow and the opening ribbon. Never use red for missed tasks, errors in progress, or anything the user did "wrong".
- **Yellow is a fill, never a text color on white.** Use `--color-yellow-text` on yellow tints.
- **Contrast:** all text must reach 4.5:1 against its background (3:1 for text 24px and larger). `--color-text-muted` is the lightest grey allowed for text.
- States that must be told apart (done / today / missed / upcoming) differ in **shape or lightness**, not hue alone.

### 2.2 Typography

Fonts (Google Fonts): **Space Grotesk** (500, 600, 700) for headings, **IBM Plex Sans** (400, 500, 600, 700) for everything else.

| Token | Font | Size / weight | Line height | Use |
|---|---|---|---|---|
| `display` | Space Grotesk | 40px / 700 (phone 28) | 1.15 | Celebration headlines |
| `h1` | Space Grotesk | 34px / 700 (phone 26), letter-spacing −0.02em | 1.15 | Page titles |
| `task-title` | Space Grotesk | 30px / 700 (phone 24) | 1.15 | Today's task |
| `h2` | Space Grotesk | 22px / 700 | 1.2 | Card headings (large) |
| `h3` | Space Grotesk | 18px / 700 (16 in small cards) | 1.25 | Card headings |
| `body` | IBM Plex Sans | 16px / 400 | 1.55–1.6 | Main text, chat bubbles |
| `body-sm` | IBM Plex Sans | 15px / 400 | 1.55 | Descriptions |
| `button` | IBM Plex Sans | 16px / 600 (secondary 15px / 500) | — | Buttons |
| `caption` | IBM Plex Sans | 14px / 500, 13px / 400 | 1.4 | Dates, meta |
| `label` | IBM Plex Sans | 12px / 600, uppercase, letter-spacing 0.06em | — | Tags like "TODAY'S BRICK" |

### 2.3 Spacing, radius, elevation, size

| Token | Value |
|---|---|
| Spacing scale | 4, 8, 12, 16, 20, 24, 32, 40px |
| Gap between cards | 20px desktop, 16px phone |
| Card padding | 22–28px desktop, 18–20px phone |
| Page padding | 36px 40px desktop; 20px 16px phone |
| Radius | buttons 10px · inputs 12px · cards 14px · dialogs 18px · chips/pills 999px · teammate badges 7–9px |
| Shadow (dialogs) | `0 20px 50px rgba(20,32,46,0.3)` |
| Shadow (floating button) | `0 6px 16px rgba(20,32,46,0.2)` |
| Min touch target | 44 × 44px for every tappable element |
| Icons | 20–24px line icons, stroke 2px, round caps and joins, `currentColor` |

### 2.4 Breakpoint

- **One breakpoint: 700px.** Below 700px → phone layout. 700px and above → desktop layout.

### 2.5 Motion

| Animation | Spec |
|---|---|
| Dialog appear | scale 0.9 → 1, opacity 0 → 1, ~400ms, slight overshoot |
| Confetti | 70–90 pieces, 6–14px, rectangles and dots, colors `yellow, navy, sky, white, confetti-accent`, fall 2.6–4.6s, staggered 0–1.4s |
| Milestone stamp | lands from scale 2.2 → 1 at −14° rotation, 700ms, starts 500ms after the dialog |
| Stage bar fill | 900ms ease-out, starts after the stamp |
| Scaffolding down | moves 60px down + fades out over 1.6s |
| Ribbon cut | two halves rotate ±55° and fall, 900ms |

**Reduced motion:** when `prefers-reduced-motion: reduce` is set, skip confetti and all animations. Show final states and messages immediately.

---

## 3. Layout and navigation

### 3.1 Desktop (≥ 700px)

- **Left sidebar**, 232px, background `--color-navy`, padding 28px 18px.
  - Logo at the top: 34px yellow rounded square with the scaffold icon, plus "Scaffold" (Space Grotesk 22px / 700, white).
  - Menu items (44px tall, radius 8px, icon + label): **Home, Progress, Plan, Talk to Team, Profile**.
  - **Active item:** yellow background, ink text, weight 600. **Inactive:** `--color-text-on-navy`.
- Main content to the right. Pages use a max width of about 1040px; chat screens 720–820px.

### 3.2 Phone (< 700px)

- **Top bar:** navy, 12px 20px padding, logo (30px) + "Scaffold" (20px). The **Profile** icon button (44px) sits on the right. On the Profile screen it's shown active, with a yellow circle.
- **Bottom tab bar** (sticky, white, top border `--color-line`): **Home, Progress, Plan, Team**. Each tab is at least 56px tall, with the icon in a 56×30 pill and a 12px label. **Active tab:** yellow pill, ink label, weight 600.
- Content stacks in one column.

### 3.3 Screen map and routes (suggested)

| Screen | Suggested route | Canvas artboard(s) |
|---|---|---|
| Home — no goal (new / resume) | `/` | HomeEmpty, HomeResume (+ Phone) |
| Progress — no goal | `/progress` | EmptyProgress (+ Phone) |
| Plan — no goal | `/plan` | EmptyPlan (+ Phone) |
| Team — no goal (goal-finder chat) | `/team` | EmptyTeam (+ Phone) |
| Onboarding chat (Alice, WOOP) | `/onboarding` | Onboard (+ Phone) |
| Plan review + commit | `/onboarding/plan` | PlanReview (+ Phone) |
| Home — active | `/` | Main (desktop), HomePhone |
| Progress | `/progress` | Progress (+ Phone) |
| Plan — Tasks / Learning log | `/plan`, `/plan/log` | Plan, PlanLog (+ Phones) |
| Talk to Team | `/team` | Team (+ Phone) |
| Profile + abandon flow | `/profile` | Profile, ProfileWarn (+ Phones) |
| Celebrations (overlays) | — | CelebrateWeek, CelebrateStage, CelebrateHouse (+ Phones) |

The same route shows the **no-goal** or **active** version depending on whether the user has a committed goal. **Nothing is locked**: every tab works before a goal exists, it just shows an empty state that points to Alice.

---

## 4. Components

### 4.1 Buttons

| Variant | Look | Use |
|---|---|---|
| **Primary** | navy fill, white text, 48–52px tall, radius 10 | The one main action on a screen: Mark as done, Keep building, Save changes, I commit to this plan |
| **Secondary** | white fill, 1px `--color-input-border`, ink text 15px / 500 | Optional actions next to a primary: Add a note, Add a photo, See your house, Ask for changes |
| **Highlight** | yellow fill, ink text 16–17px / 700 | Moving forward after a step or milestone: See your plan, Design this goal with Alice, Start this house, Cut the ribbon |
| **Danger** | white fill, 1.5px `--color-danger` border, danger text | **Only** "Yes, I want to abandon this project". Always placed below a safer primary. |
| **Text link** | navy text, underline on hover, min 44px hit area | Going somewhere else: See progress, Not sure what to build? Chat with Alice |
| **Icon button** | 44–52px square or circle with an `aria-label` | Send, Add a photo (phone), Profile |

**Rule:** if two buttons sit together, only one is filled.

### 4.2 Chips

- **Suggestion chip:** pill, 44px tall, 1.5px navy border, navy text 14–15px / 500, white fill. Used for quick replies in chats.
  - **Phone:** one row that scrolls sideways (no wrapping). **Desktop:** chips wrap.
- **Status tag:** small rounded label. For example "TODAY'S BRICK" uses yellow tint with yellow text, and "Stage 3 of 5 · Walls" uses the track color with secondary text.

### 4.3 Cards

| Variant | Look | Use |
|---|---|---|
| Standard | white, 1px `--color-line`, radius 14 | Most content |
| Dark | `--color-ink` fill, white text, yellow uppercase label | Teammate message on Home, if–then plans |
| Navy | `--color-navy` fill, yellow big number | Houses built |
| Current | 2px yellow border, `--color-yellow-wash` fill | Today's row, current milestone, current house on path |
| Not yet | 1.5px dashed `--color-input-border`, no fill | Future milestones, unplanned weeks, "talk to the team first" suggestion |
| Quiet box | `--color-bg` fill, radius 10–12 | WOOP answers, notes, sub-sections inside cards |

### 4.4 Teammate badge and labels

- **Badge:** navy rounded square (26–36px, radius 7–9) with the yellow initial (A, G, P, S) in Space Grotesk 700.
- **Name label:** always written **"Name · Role"**, e.g. "Georgina · General Contractor", 13px / 600 navy. Shown above the **first** message in a run from that teammate.
- Never draw or illustrate teammates.

### 4.5 Chat (used by Onboarding, Goal-finder, Talk to Team)

- **Team bubble:** white, 1px line border, radius `4px 16px 16px 16px`, max-width ~82%, left-aligned, 16px text. Supports line breaks (`white-space: pre-line`) for lists.
- **User bubble:** navy fill, white text, radius `16px 16px 4px 16px`, right-aligned.
- **Join notice:** centered pill, track color, 13px: "Georgina joined the conversation".
- **Scrolling:** newest messages at the bottom; the view sticks to the bottom.
- **Composer** (white bar, top border):
  - a suggestion-chip row
  - a text input (48px, radius 12, `--color-bg` fill), with a placeholder that changes per question
  - a send button (48px navy square, arrow icon, `aria-label="Send"`)
  - The input has a visually hidden `<label>`.
- **Teammate picker (Talk to Team only):**
  - **Desktop:** a row of 5 selectable cards (Let the team decide, Alice, Georgina, Paula, Sarah), each with a badge, name and one-line job. The selected card has a yellow border and yellow-wash fill, and uses `aria-pressed`.
  - **Phone:** a 48px button **inside the composer, left of the input**, showing the current choice: a yellow badge "✱" for the team, or the teammate's initial on navy. Tapping it opens a **bottom sheet** titled "Who do you want to talk to?" with the same 5 options (56px rows, check mark on the selected one). Choosing an option closes the sheet. The input placeholder becomes "Message Sarah" or "Message your team".

### 4.6 Proposed plan change card (Talk to Team)

- White card, 2px yellow border, radius 14.
- Header "Proposed plan change", plus a status tag:
  - **Waiting for you** (yellow tint)
  - **Confirmed** (navy)
  - **Not applied** (track)
- A one-line summary, then one row per affected task: the day label, the **old task struck through**, and **→ new task** in bold.
- A lock icon with "Nothing changes until you confirm."
- Buttons: **Yes, update my plan** (primary) and **Keep my plan as it is** (secondary).
- **After confirming:** a yellow-tint strip "Your plan is updated." with a "See it in Plan" link.
- **After declining:** a quiet box "No changes made. Your plan stays exactly as it was."

### 4.7 Progress indicators

- **Stage bar:** 5 equal segments (8px tall, round), each with a label below.
  - Finished: slate. Current: track with a navy fill showing partial progress. Future: track.
  - Stage names: Groundwork, Foundation, Walls, Roof, Finishing.
- **Onboarding step bar:** 5 segments: **You, Wish, Outcome, Obstacle, Plan**.
  - Done: navy. Current: yellow, label weight 600. Future: track.
- **Weekly tracker (Home):** 7 day columns (M–S), each a 28px block. Done: navy. Today: 2px dashed yellow outline. Other days: track. A caption below, e.g. "Today's brick plus one more day this week hits your target."
- **Progress bar:** 8px track with a navy or yellow fill.

### 4.8 Dialogs and sheets

- **Desktop:** a centered dialog, max-width 440–480px, radius 18, shadow, scrim behind.
- **Phone:** the same content as a bottom sheet (rounded top corners 18px, grab handle).
- Use `role="dialog"` (or `role="alertdialog"` for the abandon warning) and `aria-modal="true"`, with a heading as `aria-labelledby`. Move focus into the dialog, trap it there, and return it when the dialog closes. `Esc` closes non-destructive dialogs.

### 4.9 Number stepper (weekly target)

- **– [value] +** inside a quiet box: 44px buttons, value in Space Grotesk 26px, range 1–7.
- The buttons have `aria-label`s ("One day fewer" / "One day more"), and the value is announced with `aria-live="polite"`.
- A hint changes with the value:

  | Days | Hint |
  |---|---|
  | 1 | A gentle start. Room for a busy life. |
  | 2 | Steady and light. |
  | 3 | A good rhythm for most people. |
  | 4 | Solid progress with rest days built in. |
  | 5 | Most weekdays. Ambitious but doable. |
  | 6 | Nearly every day. Leave one day to rest. |
  | 7 | Every day. Only if it truly fits your life. |

### 4.10 Icons

24×24 viewBox, stroke 2, round. Needed set:

- home, progress (bar chart), plan (calendar), team (chat bubble), profile (person)
- send / forward arrow, check, forward-move arrow (used for a missed task), camera, pencil, lock, trophy, warning triangle, scissors, chevron down/up/right
- the **scaffold logo mark**: `M4 21V5 M20 21V5 M3 9h18 M3 15h18 M4 15l4-6`

---

## 5. The house illustration

The house is the product's main visual. Build it as an **SVG component driven by data**, not as fixed images.

**Drawing (viewBox 480 × 320):**

- **Ground line:** `--color-ground`, the full width near the bottom.
- **Foundation:** 2 rows of wide blocks.
- **Walls:** 6 rows of bricks in a running-bond pattern (alternate rows offset by half a brick).
- **Roof:** a triangle from the wall top to the peak.
- **Extras:** a door, plus windows when the house is finished.
- **Background:** blueprint grid paper, 16–20px squares in `--color-grid` on white.

**Brick and element states**

| State | Look |
|---|---|
| Finished stage | slate fill |
| Current stage, laid | navy fill |
| Still to build | no fill, 1.5px `--color-dash` dashed outline |
| Roof / door not built yet | dashed outline |
| Scaffolding | yellow poles and planks (4–5px, round caps) with thin diagonal braces, drawn over the house |
| **Finished house** | light walls (`--color-text-on-navy`), ink roof with yellow outline, yellow door, sky-blue windows with navy frames, round attic window, chimney; **no scaffolding** |

**Required states**

1. **Empty lot** (no goal): ground, a dashed house outline, a dashed door, survey stakes, and a yellow "YOUR LOT" sign.
2. **In progress:** finished stages in slate, the current stage partly navy, the rest dashed, scaffolding up.
3. **Stage complete:** the current stage fully navy (used in the milestone celebration).
4. **Finished:** the full house with scaffolding removed.

**[OPEN] Brick count vs. size.** Every task adds one brick. Decide whether each stage has a **fixed number of brick slots** (tasks fill them proportionally) or whether **bricks scale** to fit the number of tasks. Recommendation: fixed slots per stage, filled by percentage, so the drawing never changes size.

**Small house icons** (path strip, 64×48) use three styles:

- **current:** navy base, dashed walls, yellow scaffolding
- **future:** dashed outline only
- **dream:** yellow-tint fill, yellow-text outline, a yellow star

---

## 6. Screens

Every screen exists in **phone and desktop** layouts. Text in quotes is **final copy** unless marked as example data.

### 6.1 Home — before a goal is set

There are two versions, selected by whether onboarding has been started.

**New user**

- A card centered in the content area, with the empty lot illustration on top.
- **Heading:** "Every dream house starts with a plan"
- **Body:** "Your lot is ready. Tell Alice, your Architect, what you want to accomplish. It takes about 5 minutes."
- **Three step tiles,** each with a teammate badge: **Design** with Alice · **Plan** with Georgina · **Build daily** with Sarah.
- **Primary button:** "Get to work on your dream →" opens the onboarding chat.
- **Text link:** "Not sure what to build? Chat with Alice" opens the goal-finder chat (§6.3).

**Returning user with unfinished onboarding**

- **Heading:** "Welcome back, [Name]"
- **Body:** "Your design is halfway done. Alice saved everything, so you can pick up right where you stopped."
- The onboarding step bar, showing saved progress.
- A quiet box: "Your wish so far: [wish]".
- **Primary button:** "Continue where you left off →" reopens onboarding **at the saved step**.
- **Text link:** "Start over". **[OPEN]** Should it ask for confirmation first?

### 6.2 Progress and Plan — before a goal is set

Each tab shows its own empty-state card with the same primary button plus the "Not sure what to build? Chat with Alice" link and the caption "About 5 minutes with Alice".

| Tab | Illustration | Heading | Body | Button |
|---|---|---|---|---|
| Progress | Lot with a dashed house, one navy brick, a yellow arrow | "Nothing to track yet" | "This is where your house goes up. Every task you finish will add a brick, and every milestone completes a stage." | "Get to work on your dream" |
| Plan | Blank blueprint sheet titled "YOUR PLAN", dashed lines, yellow pencil | "No plan yet" | "Georgina, your General Contractor, draws up your roadmap and daily tasks once you've designed your goal with Alice." | "Design your goal with Alice" |

**Profile before a goal:** not designed yet. **[OPEN]** Suggested: contact details, weekly target and nudge time only, with no goal section.

### 6.3 Team — before a goal is set (goal-finder chat with Alice)

A full-height chat screen.

**Header:** Alice's badge, "Alice · Architect", and the line "Helps you find and design your goal. The rest of the team joins once it's set."

**Conversation flow**

1. **Alice:** "Hi, I'm Alice, your Architect. Not sure what to build yet? That's a good place to start. Let's find it together." Then: "What do you enjoy, or wish you were better at? Big dreams are welcome too."
   - Chips: Drawing · Music · Writing · Fitness · I want to build a house · I already know my goal. Free text is allowed.
2. **"I already know my goal"** → Alice: "Great, then let's go straight to designing it…" → the finish step.
3. **An interest** (e.g. Drawing) → Alice offers **3 goal ideas** as chips (example: "Become a better illustrator", "Fill a sketchbook in 3 months", "Draw my own comic page"). The user picks one or types their own → Alice confirms: "'[goal]'. That sounds like a house worth building." → the finish step.
4. **A big dream** (e.g. "I want to build a house"):
   1. **Alice:** enthusiastic, then brings in Georgina. A join notice appears.
   2. **Georgina:** "Count me in, this is my favourite kind of project. Big dreams get built one smaller goal at a time, so each step is something you can actually finish."
   3. **Georgina asks about experience,** e.g. "Have you done any carpentry or construction before? What have you built?"
   4. **Answer chips:** "No, I'd be starting from scratch" / "A little: some DIY at home" / "Yes, quite a bit".
   5. **Georgina shows the path** as a numbered list ending with "→ Your dream: [dream]", marking "← you start here" at the step that fits the user's experience. Earlier steps are marked "(you've got this)".
   6. **Alice:** "So your first goal is '[first step]'. Every goal you finish is a step closer to your dream. Ready to design it?"
5. **Finish step:** the composer is replaced by a highlight button **"Design this goal with Alice →"** (opens onboarding with the goal prefilled) and a text button "Explore another idea" (restarts the chat).

**AI behavior:** goal ideas and paths are generated by the model, not fixed lists. Paths must start at the user's real level, and **each step must be finishable in weeks, not years**.

### 6.4 Onboarding chat (Alice)

- **Layout:** full-height chat. Header with the logo, "Saved as you go", and the onboarding step bar (You → Wish → Outcome → Obstacle → Plan). Blueprint grid behind the messages.
- **Progress is saved after every answer.**

**Turn sequence** (each question is a chat message, with suggestion chips and free text):

| # | Step bar | Alice asks | Example chips |
|---|---|---|---|
| 1 | You | Intro ("Hi, I'm Alice, your Architect. You're the builder here…") then "What should I call you?" | [name] |
| 2 | You | "Sarah, your Site Lead, will send you one WhatsApp message a day with your task. When should it arrive?" | Morning 8:00 · Lunchtime 13:00 · Evening 19:00 |
| 3 | You | "How many days a week do you want to build? Pick a number that leaves room for real life. You can change it later." | 3 days · 4 days · 5 days |
| 4 | Wish | "Now let's design your house. We'll use a method called WOOP…" then "Wish: what do you want to accomplish?" | (from goal-finder, or examples) |
| 5 | Wish | **Experience:** "Good one. Have you done any of this before? It helps Georgina choose the right starting point, so tasks are never too easy or too hard." | Complete beginner · I [do this] sometimes · I've had lessons or training |
| 6 | Outcome | "Outcome: imagine you've got there. What's the best thing about it?" then "This is your why. We'll remind you of it when things get hard." | (examples) |
| 7 | Obstacle | "Obstacle: what's the main thing inside you that gets in the way? Be honest, nobody's grading this." | (examples) |
| 7b | Obstacle | **Only if the answer is vague** (e.g. "life gets busy"): a gentle follow-up asking for something more specific | — |

**Closing messages**

- **If the obstacle involves the phone** (scrolling, social apps): "That's honest, and really common. One idea: set a daily limit for those apps in your phone's Screen Time settings. Totally up to you, Scaffold won't check."
- **Alice:** "Thank you, [Name]. Your design is ready. I'm handing it to Georgina, your General Contractor, to turn it into a plan."
- **Georgina:** "Got it! I've drawn up your roadmap and your first two weeks of tasks, starting from where you are now. Each one takes 5 to 15 minutes."
- **Then:** a highlight button "See your plan →" and a text button "Start over".

### 6.5 Plan review and commit

- **Header:** the step bar with Plan current.
- **Intro:** Georgina's badge, then "Here's your plan, [Name]" and "Five stages to your finished house. Only the first two weeks are broken into daily tasks, so nothing gets overwhelming. Look it over, then commit when it feels right."
- **Your design:** three quiet boxes (Wish, Outcome · your why, Obstacle) and an "Edit with Alice" link.
- **Roadmap:** 5 milestone cards. Stage 1 is "current" (yellow border); the rest are "not yet" (dashed). They sit in 5 columns on desktop and stack on phone.
- **Your first two weeks:** a Week 1 / Week 2 segmented control. Each row shows the day number, the task, and a "[n] min" tag.
- **When the obstacle shows up:** a dark card with 1–2 if–then plans, where "If" and "then" are in yellow.
- **Sticky commit bar** at the bottom: "[n] days a week · daily WhatsApp nudge at [time] from Sarah", a secondary "Ask for changes" button (**[OPEN]** routes to Alice or Georgina?), and a primary **"I commit to this plan"**, which leads to Home (active).

### 6.6 Home — active goal

Content order (the phone stacks in this order):

1. **Greeting:** a caption with the date and "Day [n] of 14", h1 "Good afternoon, [Name]".
2. **Goal box** (links to Progress): "Building: **[goal]**". If the user has a dream: "House [n] of [m] toward: **[dream]**".
3. **Today's task card** (the largest element):
   - tag "TODAY'S BRICK", plus "About [n] minutes"
   - the task title, and a short how-to text
   - buttons: **Mark as done** (primary; full width on phone), Add a note, Add a photo
4. **Your house** (small): the house illustration, "Stage [n] of 5: [stage] · [n] bricks laid", a progress bar, and a "See progress" link.
5. **This week:** the weekly tracker, "This week: [done] of [target] days".
6. **Your if–then plan:** the if–then text and "Why you started: [Outcome]".
7. **Teammate message** (dark card): today's line from Sarah, plus a "Talk to the team" link.

**[OPEN] Not designed:** the Home state **after** today's task is marked done ("done for today", keep going / stop).

### 6.7 Progress

1. **Header:** "House [n] · [goal]", h1 "Your house is going up".
2. **Your path** (only if the user has a dream): "Each goal is its own house. [built] of [m] built."
   - A horizontal row of small house icons with chevrons between them. The current house is a "current" card; future houses are quiet boxes; the dream is a yellow-tint box with the star icon.
   - It scrolls sideways on phone.
3. **House card:** "Stage [n] of 5: [stage]", "[n] bricks laid", the large house on grid paper, a legend (Finished stages / This stage / Still to build), and the stage bar.
4. **Weekly target card:** a big number "[done] of [target] days this week", a progress bar, and the streak "[n] weeks on target in a row" with a trophy icon.
5. **Houses built card** (navy): the big yellow number and "When this one is done, the scaffolding comes down."
6. **Roadmap:** 5 milestone cards in done / current / later styles, each with "[n] bricks" and the milestone title, plus a "See daily tasks in Plan" link.

### 6.8 Plan

**Header:** "Stage [n] of 5 · [stage]: [milestone]", h1 "Plan". Two controls:

- **Tabs** (`role="tablist"`): **Tasks** | **Learning log**
- **"Show" dropdown:** Last week · This week (default) · Next week · This milestone

**Weeks start on Monday.** **Never show the whole plan at once.**

**Tasks tab:** one card per week, with a header (week dates + a summary tag such as "2 of 4 days so far", "5 days done · target hit" in yellow tint, or "6 tasks planned"). Each row shows the day, date, a status icon, the task title and "[n] min":

| Status | Icon | Row extras |
|---|---|---|
| Done | navy circle with check | Note in italics (in quotes) and/or a "Photo added" tag. Buttons: **Add a note / Edit note**, **Add a photo** (only if none) |
| Today | yellow ring | Row in yellow wash, bold title, **Mark as done** button |
| Missed | grey circle with forward arrow | Muted title + "Not done. Moved to the next day, and the plan shifted with it." **No red.** |
| Upcoming | dashed circle | Muted title |

- **Adding a note to a past task** opens an inline form inside the row: the label "Your note: what did you learn or notice?", a textarea (placeholder "Today I achieved…"), **Save note** and **Cancel**.
- **The end of the planned 2-week chunk** shows a dashed card with Georgina's badge: "[date] onward isn't planned yet. Georgina plans the next 2 weeks on [date], based on how these two went."

**Learning log tab**

- **Intro:** "Everything you've noted or photographed after a task. You can add a note or photo to any finished task, any time, from the Tasks tab. [n] entries"
- **Grid** of entry cards (3 columns desktop, 1 phone), newest first. Each card has an optional photo (150px tall, `object-fit: cover`), the date (label style), the task title and the note in italics.
- It uses the same "Show" filter.
- **Empty:** "Nothing here yet. Entries appear after you finish a task and add a note or photo."

**[OPEN]** Should missed days stay visible as rows (current design) or be hidden?

### 6.9 Talk to Team

- **Desktop header:** h1 "Talk to Team", "Let the team decide who answers, or pick someone.", and the picker cards (§4.5).
- **Phone:** **no header row**. The picker lives in the composer; the "Team" tab shows where the user is.
- **Messages** use the chat components. Default suggestion chips: "This task is too big" · "How am I doing?" · "Remind me why I started" · "I'm tired today".
- **Plan change proposals** appear as the proposed-change card (§4.6) inside the conversation.
- **Who answers:** see §7.6.
- **[OPEN]** Keep the full chat history, or start fresh each day?

### 6.10 Profile

Cards, top to bottom:

1. **Current goal:** the "Stage [n] of 5 · [stage]" tag; Wish and "Your why" in quiet boxes; a **Change goal** secondary button with the note "You can have one goal at a time."
2. **Weekly target:** the number stepper (§4.9) and the note "Changes apply right away, including this week."
3. **Daily nudge from Sarah:** a select labeled "WhatsApp message arrives at".
4. **Contact details:** Email and WhatsApp number inputs (2 columns desktop, 1 phone) and **Save changes**.
5. **Houses built** (navy card): "Finished houses stay in this count forever, whatever happens next."
6. **Log out** text button.

**Abandon flow** (from "Change goal"): an `alertdialog`, which is a bottom sheet on phone.

- A warning icon in a danger-tint square.
- **Heading:** "Abandon this house?"
- **Body:** "Changing your goal **deletes this whole project**. It can't be brought back."
- **Two boxes** (side by side on desktop, stacked on phone):
  - **"Deleted forever"** (danger tint): your house ([n] bricks, Stage [n] of 5) · your goal and WOOP answers · your roadmap and plan · your learning log: all notes and photos · team chats about this goal
  - **"You keep"** (quiet): your houses-built count · your account and settings
- **Dashed suggestion card:** Paula's badge, "**Not sure? Talk to the team first.** Sometimes the goal is right and only the plan needs adjusting." It links to Talk to Team.
- **Buttons, stacked:** **Keep building** (primary) above **Yes, I want to abandon this project** (danger).
- **After confirming:** "A fresh lot is ready" / "Your old project has been deleted. Changing direction is part of building. Alice is ready to design your next house with you." with a **Start with Alice** button that opens onboarding.

### 6.11 Celebrations

All three are overlays over the current screen. They are dialogs on desktop and full-width cards on phone.

**A. Weekly target hit**

- A scrim, confetti falling behind the dialog, and a dialog with a 76px yellow trophy tile.
- **Heading:** "Congratulations, you hit your weekly target!"
- "[done] of [target] days this week. [n] bricks in the wall.", a row of day pills (the last one yellow), and the streak tag "[n] weeks on target in a row".
- A Sarah line in a quiet box, e.g. "That's a full week of work. Anything more this week is a bonus, not a must."
- **Button:** "Back to building" (primary, full width).

**B. Stage complete (milestone).** No confetti.

- The dialog shows the house on grid paper with the completed stage fully navy, scaffolding still up and the next part dashed.
- A **navy-outlined stamp** lands on the drawing: "STAGE [n]" / "COMPLETE", rotated −14°.
- Tag "MILESTONE REACHED", then a heading such as "The walls are up!", then "You finished **[milestone]**. Stage [n] of 5 is done."
- The stage bar animates the completed segment to full and adds "✓" to its label.
- **Paula's line:** "Next up is the **[next stage]: [next milestone]**. Georgina is planning your next two weeks now."
- **Buttons:** **Keep building** (primary), **See your house** (secondary, opens Progress).

**C. House complete (finale)**

- Full screen: a navy background with a faint white grid.
- **Steps:**
  1. **Reveal** (automatic): "House [n] · [goal]" / "The scaffolding is coming down…" while the scaffolding animates away (~2.6s).
  2. **Ribbon:** the headline "You built this. Every brick.", "Time to open it properly."; a red ribbon with a bow across the house; a big highlight button **"Cut the ribbon"** with a scissors icon. **The user must tap it. Never auto-cut.**
  3. **Opened:** the ribbon halves fall, confetti bursts, "Officially open" / "House [n] complete!" / "You set a goal, stuck with it and finished it."
- **Houses-built tile:** the number pops up by one, "**House built.** It stays in your count forever."
- **Next step:**
  - **With a dream:** Alice says "What a build. You're one house closer to **[dream]**. Next on your path:", then a dashed yellow card "House [n] of [m] · [next goal]". Buttons: **Start this house** (highlight), **Choose something else** (opens the goal-finder), and a "See your learning log" link.
  - **Without a dream:** "Start your next house" and "See your learning log".

---

## 7. Behavior rules (decided during design)

These are product decisions. Implement them exactly.

### 7.1 Tasks and proof

- **"Mark as done" is the official record** of a finished task. Proof is never required; the app works on honesty.
- **Notes and photos are optional** and can be **added or edited any time later** from Plan. Adding them later never changes when the task was done and never affects targets or streaks.
- **A missed task rolls forward:** tomorrow shows the same task, and the plan shifts by one day.
- Proof sent by WhatsApp reply appears in the learning log (PRD).

### 7.2 Weekly target and streak

- The user sets 1–7 days per week. **Changes apply immediately**, including the current week.
- **Streak** = consecutive weeks where the target was hit. If the target was lowered to or below the days already done, that week counts **only after the next task is marked done that week** (the same rule as the celebration).
- A week below target gets **no message at all**.

### 7.3 Celebrations

- **Celebrations are only ever triggered by marking a task done.** Changing a setting never triggers one.
- **Weekly:** fires when the completion that reaches the target is marked done. If the target was lowered to or below the days already done, it fires on the **next** task marked done that week.
- **Milestone:** fires when the last task of a stage is marked done.
- **House:** fires when the last stage is completed.
- **Ordering:** if one task completes a stage **and** hits the weekly target, show the **milestone first**. Show the weekly celebration **after the milestone dialog is closed** with "Keep building". Never stack two dialogs.
- Respect reduced motion (§2.5).

### 7.4 Goals, houses and dreams

- **One active goal (house) at a time.**
- A user may have **one optional dream**. Georgina breaks it into a **path** of goals sized to the user's experience. **Each goal on the path is its own house.**
- Finishing a house offers the next house on the path ("Start this house"), or lets the user choose something else.
- The **houses-built** count only ever increases.
- **[OPEN]** Is the dream named separately, or can a big WOOP Outcome become the dream (as in the example data)? Recommendation: dream optional; path strip hidden when there's none.

### 7.5 Abandoning a goal

- Requires the explicit button **"Yes, I want to abandon this project"**.
- **Deletes everything tied to that project:** house progress, goal and WOOP answers, roadmap and plan, learning log (notes and photos) and team chats about the goal.
- **Keeps:** account, settings and the houses-built count.
- **[OPEN]** Does the dream survive when its current house is abandoned? Recommendation: yes.

### 7.6 Talk to Team routing

- **Default ("Let the team decide"):** the teammate whose role matches the topic answers.
  - plan changes / task too big → **Georgina**
  - feelings / motivation / tiredness → **Sarah**
  - goal / why → **Alice**
  - progress / how am I doing → **Paula**
  - unclear → **Paula**
- **When the user picks a teammate:** that teammate answers first. If the topic belongs to another role, they **hand over** ("Let me bring in Georgina, she handles the plan."), a join notice appears, and the colleague answers. Several teammates can be in one conversation.
- **A teammate can propose plan changes, but nothing changes until the user confirms.** Confirmed changes appear in Plan.
- **Before a goal exists,** the Team tab is the goal-finder chat with Alice (§6.3), and Georgina can join for big dreams.

### 7.7 Before a goal exists

- **Nothing is locked.** Every tab shows a friendly empty state pointing to Alice.
- **Onboarding progress is saved after every answer.** Home offers "Continue where you left off" with the saved step.

### 7.8 From the PRD (unchanged, listed for completeness)

- One WhatsApp nudge per day at the user's chosen time, with a motivational line and today's task.
- Missed-day sequence:
  - day 1: gentle nudge
  - day 2: "just 5 minutes today?"
  - day 3: Sarah invites a chat to adjust the plan
  - after day 3: nudges stop
  - next week, if still no task done: a sincere email
  - the following week: a final WhatsApp voice note
  - then silence
  - any completed task resets the sequence
- The next 2-week chunk is generated toward the current milestone, informed by the last chunk.
- Each task is 5–15 minutes.

---

## 8. Accessibility checklist

- [ ] Real elements: `<button>`, `<a href>`, `<input>` + `<label>`. No click handlers on `div`s.
- [ ] Every icon-only button has an `aria-label`. Decorative SVGs use `aria-hidden="true"`. Meaningful SVGs (the house) use `role="img"` and a descriptive `aria-label` (e.g. "Your house: foundation laid, walls 20 bricks, roof still to come").
- [ ] `aria-current="page"` on the active nav item; `aria-current="step"` on the current stage or milestone.
- [ ] Toggle buttons use `aria-pressed`; tabs use `role="tablist"` / `role="tab"` / `aria-selected`.
- [ ] Dialogs trap focus, return focus on close, and have a labelled heading. The abandon dialog is an `alertdialog`.
- [ ] Every tap target is ≥ 44 × 44px.
- [ ] Text contrast is ≥ 4.5:1 (3:1 at ≥ 24px). Don't rely on color alone for status.
- [ ] `prefers-reduced-motion` is honored.
- [ ] Chat updates are announced politely (`aria-live="polite"` on the message list or the latest message).
- [ ] Phone layouts have no horizontal page scroll, except deliberate sideways rows (chips, path strip).

---

## 9. Voice and copy

Gentle teammates, never a drill sergeant. Short sentences. Talk to the user as "you", the builder. Construction words (brick, stage, lot, house) are welcome when they stay clear.

| Situation | Say | Never say |
|---|---|---|
| Missed a day | "Not done. Moved to the next day, and the plan shifted with it." | "You failed to complete yesterday's task!" |
| Encouragement | "Small bricks still make solid walls." | "Don't break your streak!" |
| Plan change | "Nothing changes until you confirm." | "Your plan has been updated." (without asking) |
| Abandoning | "Changing direction is part of building." | "You gave up on this goal." |
| Tired | "A tired day still counts if you do 5 minutes. And if today is a rest day, that's allowed too." | "No excuses." |

---

## 10. Data model sketch (stack-neutral)

A starting point for the developer; adjust as needed.

```
User         id, name, email, whatsapp, nudgeTime, weeklyTarget (1–7), housesBuilt (int), createdAt
Dream        id, userId, title, experienceLevel, active (bool)                 -- optional, max 1 active
PathStep     id, dreamId, order, title, status (done|current|future), projectId? -- each step becomes a Project
Project      id, userId, pathStepId?, status (onboarding|active|complete), wish, outcome, obstacle,
             experience, ifThenPlans[], onboardingStep, committedAt, completedAt
             -- "abandoned" = hard delete of the Project and everything below it
Milestone    id, projectId, order (1–5), stageName, title, status
Task         id, projectId, milestoneId, scheduledDate, title, howTo, minutes (5–15),
             status (upcoming|today|done|missed), doneAt?, rolledFromTaskId?
Proof        id, taskId, note?, photoUrl?, source (app|whatsapp), createdAt, updatedAt
Conversation id, projectId? (null before a goal), createdAt
Message      id, conversationId, sender (user|alice|georgina|paula|sarah|system), body, kind (text|join|proposal), createdAt
PlanProposal id, messageId, status (pending|confirmed|declined), changes[{taskId, from, to}]
WeekRecord   userId, weekStart (Monday), target, doneCount, hit (bool), celebratedAt?
```

**Derived values**

- **Bricks laid** = Tasks with `status = done` in the project.
- **Current stage** = the first Milestone that isn't done.
- **Streak** = consecutive `WeekRecord.hit` ending at the current or last week.

---

## 11. Suggested build order

This follows the PRD's "core first" plan, so a working, submittable version exists early.

1. **Foundations:** tokens (§2), fonts, layout shell with sidebar / top bar / bottom tabs (§3), buttons, cards, chips, icons (§4).
2. **Sign up / log in.** **[OPEN]** Screens not designed; use the standard card + input + primary button styles.
3. **Home before a goal** (§6.1) and the other empty states (§6.2).
4. **Onboarding chat** (§6.4) with save-as-you-go.
5. **Plan review + commit** (§6.5).
6. **Home active** (§6.6) with Mark as done + note/photo.
7. **House illustration component** (§5) and **Progress** (§6.7).
8. **Weekly target celebration** (§6.11 A, rules §7.3).
9. **Plan screen + learning log** (§6.8).
10. **Talk to Team** with routing and confirmed plan changes (§6.9, §7.6).
11. **Profile + abandon flow** (§6.10, §7.5).
12. **Milestone and house celebrations** (§6.11 B, C).
13. **Goal-finder chat, dreams and paths** (§6.3, §7.4).
14. WhatsApp nudges, two-way replies, re-engagement (PRD).

---

## 12. Changes to the PRD made during design

Update `prd.md` with these:

1. **Look and feel (open question #1): answered.** The "Blueprint" direction; see §2.
2. **Onboarding profile questions (open question #5): answered.** Name, nudge time, days per week, and, after the Wish, **prior experience**.
3. **"The user doesn't pick" teammates: changed.** The team decides by default; the user **can** pick a teammate, who can bring in colleagues.
4. **"Help planning brand-new goals from scratch": moved from Deferred into scope.** Alice helps find a goal; big dreams are broken into a path of smaller goals.
5. **New concept: Dream and path.** Each step is its own house.
6. **First use:** the app is **not locked**; empty states point to Alice. (Replaces assumption #10.)
7. **House stages:** fixed names Groundwork → Foundation → Walls → Roof → Finishing, one per milestone. (Confirms assumption #11 with names; "frame/skeleton" dropped.)
8. **Weekly target changes apply immediately;** celebrations only come from marking a task done; the streak follows the same rule.
9. **Milestone + weekly on the same task:** milestone first, then weekly.
10. **Abandoning deletes everything tied to the project,** including the learning log and team chats.
11. **Notes and photos can be added or edited later;** "Mark as done" alone is the official record.
12. **Weeks start on Monday** (open question #8, partly answered; nudge time is user-chosen).

---

## 13. Open questions

| # | Question | Recommendation |
|---|---|---|
| 1 | Should every house have exactly 5 stages, or should Georgina decide? | Fixed 5 (keeps the drawing and stage names stable) |
| 2 | Brick slots fixed per stage, or bricks scale with task count? | Fixed slots, filled by percentage |
| 3 | Is the dream named separately, or can a big Outcome become the dream? Is it optional? | Optional; Alice may suggest it |
| 4 | Does the dream survive when its current house is abandoned? | Yes |
| 5 | Should "Start over" in onboarding ask for confirmation? | Yes, a light confirm |
| 6 | Should "Ask for changes" on plan review go to Alice or Georgina? | Georgina (she owns the plan) |
| 7 | Talk to Team history: keep everything or start fresh daily? | Keep, with "Today" dividers |
| 8 | Should missed days stay visible in Plan or be hidden? | Keep visible (honest, calm wording) |
| 9 | A short "ground-breaking" moment after committing? | Optional, small, no confetti |
| 10 | Profile before a goal exists | Contact, weekly target and nudge time only |
| 11 | Home after today's task is done | Not designed: needs a "done for today" state |
| 12 | Sign-up / log-in screens | Not designed: use standard components |
| 13 | Levels and rewards, refreshers, cited sources (PRD open questions #2–4) | Not designed |
| 14 | WhatsApp message templates, email and voice-note content | Not designed (copy needed) |
| 15 | Dark mode | Not designed; light only for now |
| 16 | WhatsApp proof: when the weekly target is reached via WhatsApp reply, where does the confetti show? | Next app visit, plus a congratulation in Sarah's WhatsApp reply |
