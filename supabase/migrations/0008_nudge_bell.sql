-- Slice 6: the hourly bell. spec.md > External Services > Supabase, Cron.
-- Supabase Cron calls the hosted app at the start of every hour, which sends
-- whichever nudges are due. Vercel's free plan can only run a job once a day.
--
-- Before running this file, store the bell's secret (the CRON_SECRET value
-- from .env.local) in Supabase Vault once, so it never sits in this file:
--   select vault.create_secret('<CRON_SECRET value>', 'cron_secret');

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'nudge-bell',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://scaffold-theta-three.vercel.app/api/cron/tick',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
