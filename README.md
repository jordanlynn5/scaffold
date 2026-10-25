# Scaffold

You're the builder, and you have a team behind you. Scaffold's AI build team
turns a goal into one small task a day, nudges you on WhatsApp with email backup, and draws your
progress as a house going up brick by brick.

Built for the Devpost "Build With AI: Basics" hackathon.

## The build team

| Teammate | Role | Does |
|---|---|---|
| Alice | Architect | Welcomes you and designs your goal with you |
| Georgina | General Contractor | Turns the goal into a roadmap and daily tasks |
| Paula | Project Manager | Tracks progress and brings in the right teammate |
| Sarah | Site Lead | Sends the daily nudge |

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

## Daily nudges (slice 6)

Set the Resend, Twilio, `APP_URL` and `CRON_SECRET` values listed in
`.env.example` locally and in Vercel. Production `APP_URL` must be the public
site address. Before applying `0008_nudge_bell.sql`, create a Supabase Vault
secret named `cron_secret` with the same value as `CRON_SECRET`. The migration
installs an hourly job that calls the protected nudge endpoint.

`WHATSAPP_SENDING=on` enables WhatsApp when consent, sandbox membership and
the 24-hour reply window permit it; email is the backup. Twilio also requires an approved Primary compliance profile in Trust Hub;
this account passed its real delivery check after verification. The `resend.dev` test sender delivers only to the Resend account
email; other recipients need a verified domain. Sarah's line remains on Home
if delivery is unavailable.

```
# App running locally, without sending messages
node --env-file=.env.local scripts/check-nudges.mjs

# Real sends to your own account (include the deployed URL to test production)
node --env-file=.env.local scripts/check-nudges.mjs https://your-app.vercel.app --real your@email
# Append --email-only to test just email while WhatsApp approval is pending.
```

## How it is built

Next.js 16, Tailwind CSS v4, Supabase (database, log-in, photos, scheduler),
Claude, the Twilio WhatsApp Sandbox and Resend, hosted on Vercel.
Set `WHATSAPP_SENDING=on` with an upgraded Twilio account to enable WhatsApp;
unset it to use email only.

- `devpost/prd.md`: what the product does
- `SCAFFOLD_DESIGN_HANDOFF.md`: how it looks and responds
- `devpost/spec.md`: how it is built
- `devpost/checklist.md`: the build steps and where the build is up to
