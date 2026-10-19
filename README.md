# Scaffold

You're the builder, and you have a team behind you. Scaffold's AI build team
turns a goal into one small task a day, nudges you on WhatsApp, and draws your
progress as a house going up brick by brick.

Built for the Devpost "Build With AI: Basics" hackathon.

## The build team

| Teammate | Role | Does |
|---|---|---|
| Alice | Architect | Welcomes you and designs your goal with you |
| Georgina | General Contractor | Turns the goal into a roadmap and daily tasks |
| Paula | Project Manager | Tracks progress and brings in the right teammate |
| Sarah | Site Lead | Sends the daily WhatsApp nudge |

## Run it on your computer

Requires Node.js 22 or newer.

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the keys.
3. In the Supabase dashboard, open **SQL Editor** and run each file in
   `supabase/migrations/` in order.
4. In Supabase, under **Authentication > Sign In / Providers > Email**, switch
   **Confirm email** off.
5. `npm run dev`, then open http://localhost:3000

For password-reset emails, set Supabase **Authentication > URL Configuration >
Site URL** to the deployed origin and allow `<origin>/auth/callback` under
Redirect URLs. For local recovery testing, also allow
`http://localhost:3000/auth/callback`. Request and open the email in the same
browser so its saved verification cookie is available.

To check the accounts setup against your Supabase project:

```
node --env-file=.env.local scripts/check-accounts.mjs
```

For the plan builder (slice 3), apply `0004_plans.sql` before running the new
app code. It adds private milestones and tasks, plus transactional draft-save
and commitment routines. Draft tasks remain undated until commitment.

```
# Pure plan-shape and calendar checks (Node.js 24+)
node scripts/check-plan-shape.mjs

# With the app running: real generation, revisions, access rules and commitment
node --env-file=.env.local scripts/check-plan.mjs
```

The second check uses disposable accounts and the configured `PLAN_MODEL`.
Pass the deployed address as its final argument to check the live app as well.

## How it is built

Next.js 16, Tailwind CSS v4, Supabase (database, log-in, photos, scheduler),
Claude, the Twilio WhatsApp Sandbox and Resend, hosted on Vercel.

- `devpost/prd.md`: what the product does
- `SCAFFOLD_DESIGN_HANDOFF.md`: how it looks and responds
- `devpost/spec.md`: how it is built
- `devpost/checklist.md`: the build steps and where the build is up to
