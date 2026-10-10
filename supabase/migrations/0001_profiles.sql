-- One row per person, created automatically when they sign up.
-- spec.md > Data Model

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text not null,
  whatsapp text,
  timezone text not null default 'UTC',
  nudge_time time not null default '09:00',
  weekly_target int not null default 3 check (weekly_target between 1 and 7),
  houses_built int not null default 0 check (houses_built >= 0),
  whatsapp_joined_at timestamptz,
  whatsapp_last_inbound_at timestamptz,
  created_at timestamptz not null default now()
);

-- Row-level security: a logged-in person can read and change only their own row.
alter table public.profiles enable row level security;

create policy "Read own profile" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "Update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- People may edit their settings, but never their houses-built count or the
-- WhatsApp timestamps. Only the server changes those.
revoke insert, update, delete on public.profiles from authenticated, anon;
grant update (name, email, whatsapp, timezone, nudge_time, weekly_target)
  on public.profiles to authenticated;

-- Create the profile row at sign-up, from what the sign-up form sent.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, whatsapp, timezone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'whatsapp',
    coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'UTC')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
