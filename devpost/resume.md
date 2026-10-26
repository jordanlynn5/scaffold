---
doc: resume
status: in-progress
---

# Submission handoff — do not start slice 7

## Current boundary

The October 26 submission contains slices 1–6. Further feature work was
explicitly stopped to prepare submission; slices 7–14 are deferred.
Slice 6 is committed as `0a037e5`, with its completion marker in `6a59ec5`.
No slice 7 implementation or database migration was written.

## Working build and verification

- Live app: https://scaffold-theta-three.vercel.app.
- Latest verified deployment: `dpl_Ha617Jv5reymG5gSAmqWPmrfXcE6`.
- Local webpack production build and lint pass. The deployed normal
  Turbopack production build passed too.
- Live nudge checks passed after deployment: channel/due boundaries,
  duplicate prevention, private access, cron authentication, signature
  rejection and a correctly signed fixture. Disposable accounts were removed.
- Real incoming WhatsApp messages reached Scaffold on October 26 and
  updated the actual account's join and last-inbound timestamps.
- The learner confirmed manual WhatsApp delivery, the same line on Home,
  the revised neutral “Hi” greeting, and the automatic email sent at
  13:00 Madrid by the existing hourly scheduler.
- The exact cause of the previous Twilio default responder was not proven.
  Real routing worked after the sandbox terms/rejoin steps; no webhook URL
  change or fabricated profile timestamp was used.
- Hourly Supabase job `nudge-bell` is installed. Its credential is already
  stored in Vault as `cron_secret`. Do not replace it or reinstall the job.

## Recording and testing

The learner is recording the app on a Mac and the WhatsApp arrival on a
phone. Start both recordings before pressing Profile → Send my nudge now.
The completed task and added brick are shown in the app. Replies on
WhatsApp do not complete tasks in this build.

A read-only check before recording found today's task still upcoming.
Do not reset progress or delete today's scheduled nudge claim for the demo.
The daily claim prevents a second scheduled send on the same day; the
manual button is independent and has a one-minute cooldown.

## Repository and remaining shipping work

- Public repository: https://github.com/jordanlynn5/scaffold.
- Default branch: `main`. The current request is to commit submission
  preparation and merge `develop` into `main` locally.
- The history audit found no configured private credentials or private
  learner profile in committed history. Local `.env` files and the learner
  profile remain ignored. Do not print or commit their contents.
- The project story requested by the learner is in `devpost/project-story.md`.
- Final review, the Privacy/Terms item, the app map/wrap-up record, video
  URL, testing-account details, exit survey and Devpost submission still
  need their actual completion recorded. Do not mark them complete without
  evidence. No demo account or license has been added.
- No push is implied by the local merge record. Obtain explicit permission
  before updating the public GitHub branches if it has not already been given.

## Service limits to preserve

WhatsApp requires consent, membership renewed within three days and an
incoming message within 24 hours. Otherwise the app attempts email.
The current Resend test sender only delivers to the owner's email until
an owned domain is verified. Sarah's line remains on Home if delivery fails.

## Useful locations

- `lib/nudges/message.ts`: neutral greeting and the shared opening line.
- `lib/nudges/send.ts`: scheduled/manual send and saved delivery receipt.
- `app/api/whatsapp/inbound/route.ts`: signature validation and connection time.
- `lib/tasks/complete.ts`: task completion, note/photo and weekly record.
- `supabase/migrations/0008_nudge_bell.sql`: existing hourly scheduler.
- `.vercelignore`: excludes credentials and private/local tooling from uploads.
