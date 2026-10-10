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

To check the accounts setup against your Supabase project:

```
node --env-file=.env.local scripts/check-accounts.mjs
```

## How it is built

Next.js 16, Tailwind CSS v4, Supabase (database, log-in, photos, scheduler),
Claude, the Twilio WhatsApp Sandbox and Resend, hosted on Vercel.

- `devpost/prd.md`: what the product does
- `SCAFFOLD_DESIGN_HANDOFF.md`: how it looks and responds
- `devpost/spec.md`: how it is built
- `devpost/checklist.md`: the build steps and where the build is up to
