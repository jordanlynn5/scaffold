-- Slice 6: the daily nudge. spec.md > Components > Nudge Sender, Data Model.
-- One row per nudge sent. Only the server writes here.

create table public.nudge_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- The day in the person's own time zone.
  sent_on date not null,
  -- "scheduled" comes from the hourly bell, "manual" from
  -- "Send my nudge now" in Profile.
  trigger text not null check (trigger in ('scheduled', 'manual')),
  kind text not null default 'normal',
  channel text check (channel in ('whatsapp', 'email')),
  -- Twilio's or Resend's id for the message, once it has gone.
  provider_id text,
  created_at timestamptz not null default now()
);

-- Nobody gets two scheduled nudges in one day. The row is written before the
-- message is sent, so two bells ringing at once cannot both send.
create unique index nudge_log_one_scheduled_per_day
  on public.nudge_log (user_id, sent_on) where trigger = 'scheduled';

alter table public.nudge_log enable row level security;
create policy "Read own nudges" on public.nudge_log
  for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete on public.nudge_log from anon, authenticated;

-- Nudge times are now on the hour, because the bell rings once an hour.
-- Existing times move to the nearest hour.
update public.profiles
  set nudge_time = (date_trunc('hour', nudge_time + interval '30 minutes'))::time
  where extract(minute from nudge_time) <> 0;
alter table public.profiles
  add constraint nudge_time_on_the_hour
  check (extract(minute from nudge_time) = 0 and extract(second from nudge_time) = 0);
