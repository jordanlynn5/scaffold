begin;
create table public.proofs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.tasks(id) on delete cascade,
  note text check (length(note) <= 4000),
  photo_path text,
  source text not null check (source in ('app','whatsapp')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.week_records (
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null check (extract(isodow from week_start) = 1),
  target integer not null check (target between 1 and 7),
  done_count integer not null default 0 check (done_count between 0 and 7),
  hit boolean not null default false,
  celebrated_at timestamptz,
  primary key (user_id, week_start)
);
create table public.pending_celebrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('weekly','stage','house')),
  event_key text not null,
  payload jsonb not null,
  shown_at timestamptz,
  unique (user_id, kind, event_key)
);
alter table public.proofs enable row level security;
alter table public.week_records enable row level security;
alter table public.pending_celebrations enable row level security;
create policy "Read own proofs" on public.proofs for select to authenticated using (
  exists (select 1 from public.tasks t join public.projects p on p.id = t.project_id
    where t.id = task_id and p.user_id = (select auth.uid()))
);
create policy "Read own weeks" on public.week_records for select to authenticated using (user_id = (select auth.uid()));
create policy "Read own celebrations" on public.pending_celebrations for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete on public.proofs, public.week_records, public.pending_celebrations from anon, authenticated;
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('proofs', 'proofs', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "Read own proof photos" on storage.objects for select to authenticated
using (bucket_id = 'proofs' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Lock the person first: simultaneous requests for different tasks must not
-- race the weekly count. All completion records commit together or not at all.
create function public.complete_task(p_user_id uuid, p_task_id uuid, p_note text, p_source text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  person public.profiles; task public.tasks; project public.projects;
  today date; monday date; days_done integer; earned jsonb := '[]'; item record;
begin
  select * into person from public.profiles where id = p_user_id for update;
  if not found then raise exception 'Unknown builder'; end if;
  select t.* into task from public.tasks t join public.projects p on p.id = t.project_id
    where t.id = p_task_id and p.user_id = p_user_id for update of t;
  if not found then raise exception 'Task not found'; end if;
  if task.status = 'done' then return jsonb_build_object('alreadyDone', true, 'celebrations', '[]'::jsonb); end if;
  select * into project from public.projects where id = task.project_id;
  today := (now() at time zone person.timezone)::date;
  if project.status <> 'active' or task.scheduled_date <> today or task.scheduled_date is null then
    raise exception 'Only today''s active task can be completed';
  end if;
  monday := today - (extract(isodow from today)::integer - 1);
  update public.tasks set status = 'done', done_at = now() where id = task.id;
  insert into public.proofs(task_id, note, source) values (task.id, nullif(trim(p_note), ''), p_source);
  select count(distinct (t.done_at at time zone person.timezone)::date) into days_done
    from public.tasks t join public.projects p on p.id = t.project_id where p.user_id = p_user_id
    and t.status = 'done' and (t.done_at at time zone person.timezone)::date between monday and monday + 6;
  insert into public.week_records(user_id, week_start, target, done_count, hit)
    values (p_user_id, monday, person.weekly_target, days_done, days_done >= person.weekly_target)
    on conflict (user_id, week_start) do update set target = excluded.target,
      done_count = excluded.done_count, hit = excluded.hit;
  -- The saved two-week chunk may end midway through a stage. Never infer a
  -- finished stage/house from running out of the currently generated tasks.
  if days_done >= person.weekly_target then
    for item in insert into public.pending_celebrations(user_id, kind, event_key, payload)
      values (p_user_id, 'weekly', monday::text, jsonb_build_object('week_start', monday, 'target', person.weekly_target))
      on conflict do nothing returning id, kind, payload
    loop earned := earned || jsonb_build_array(to_jsonb(item)); end loop;
  end if;
  return jsonb_build_object('alreadyDone', false, 'celebrations', earned);
end;
$$;
revoke all on function public.complete_task(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.complete_task(uuid, uuid, text, text) to service_role;
commit;
