-- Sign-up asks for consent to one WhatsApp message a day (handoff §6.0b).
-- Nudges are only sent to people who said yes.

alter table public.profiles
  add column whatsapp_consent boolean not null default false;

grant update (whatsapp_consent) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, whatsapp, timezone, whatsapp_consent)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'whatsapp',
    coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'UTC'),
    coalesce((new.raw_user_meta_data ->> 'whatsapp_consent')::boolean, false)
  );
  return new;
end;
$$;
