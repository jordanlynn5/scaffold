-- Drafts remain undated until the builder explicitly commits. Each replacement
-- and commit is one transaction, locked on the project to prevent mixed plans.
begin;
alter table public.projects add column draft_plan jsonb;
alter table public.projects add column plan_revision integer not null default 0;

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  position integer not null check (position between 1 and 5),
  stage_name text not null check (stage_name in ('Groundwork','Foundation','Walls','Roof','Finishing')),
  title text not null,
  status text not null default 'upcoming' check (status in ('upcoming','current','done')),
  unique (project_id, position),
  unique (id, project_id)
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid not null,
  position integer not null check (position > 0),
  scheduled_date date,
  title text not null,
  how_to text not null,
  count integer not null check (count > 0),
  minutes_per_item numeric not null check (minutes_per_item > 0),
  minutes numeric not null check (minutes > 0 and minutes <= 30),
  why text not null check (length(trim(why)) > 0),
  is_mastery boolean not null default false,
  status text not null default 'upcoming' check (status in ('upcoming','done','missed')),
  done_at timestamptz,
  rolled_from_task_id uuid references public.tasks(id) on delete set null,
  foreign key (milestone_id, project_id) references public.milestones(id, project_id) on delete cascade,
  check (minutes = count * minutes_per_item),
  unique (project_id, position)
);
create index tasks_project_date on public.tasks(project_id, scheduled_date);
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
create policy "Read own milestones" on public.milestones for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));
create policy "Read own tasks" on public.tasks for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));
revoke insert, update, delete on public.milestones, public.tasks from authenticated, anon;

create function public.save_draft_plan(p_user_id uuid, p_project_id uuid, p_revision integer, p_plan jsonb)
returns integer language plpgsql security invoker set search_path = public as $$
declare
  p public.projects;
  m jsonb;
  t jsonb;
  n integer;
begin
  select * into p from public.projects where id = p_project_id and user_id = p_user_id for update;
  if not found or p.status not in ('onboarding','draft_plan') or p.onboarding_step <> 'done'
    or p.plan_revision <> p_revision then
    raise exception 'The plan changed. Reload before trying again.';
  end if;
  if jsonb_array_length(p_plan->'milestones') <> 5 or jsonb_array_length(p_plan->'tasks') <> 14
    or jsonb_array_length(p_plan->'if_then_plans') < 1 then
    raise exception 'Incomplete plan';
  end if;
  delete from public.tasks where project_id = p.id;
  delete from public.milestones where project_id = p.id;
  n := 0;
  for m in select * from jsonb_array_elements(p_plan->'milestones') loop
    n := n + 1;
    insert into public.milestones(project_id, position, stage_name, title, status)
      values (p.id, n, (array['Groundwork','Foundation','Walls','Roof','Finishing'])[n], m->>'title',
        case when n = 1 then 'current' else 'upcoming' end);
  end loop;
  n := 0;
  for t in select * from jsonb_array_elements(p_plan->'tasks') loop
    n := n + 1;
    insert into public.tasks(project_id, milestone_id, position, title, how_to, count, minutes_per_item, minutes, why)
      select p.id, id, n, t->>'title', t->>'how_to', (t->>'count')::integer,
        (t->>'minutes_per_item')::numeric, (t->>'minutes')::numeric, t->>'why'
      from public.milestones where project_id = p.id and position = (t->>'milestone')::integer;
    if not found then raise exception 'Unknown milestone'; end if;
  end loop;
  update public.projects set status = 'draft_plan', draft_plan = p_plan,
    if_then_plans = p_plan->'if_then_plans', plan_revision = plan_revision + 1 where id = p.id;
  return p_revision + 1;
end;
$$;

create function public.commit_draft_plan(p_user_id uuid, p_revision integer)
returns uuid language plpgsql security invoker set search_path = public as $$
declare p public.projects; first_day date;
begin
  select * into p from public.projects where user_id = p_user_id and status <> 'complete' for update;
  if not found then raise exception 'No plan to commit'; end if;
  -- Repeating a successful commit never shifts the original dates.
  if p.status = 'active' and p.plan_revision = p_revision then return p.id; end if;
  if p.status <> 'draft_plan' or p.plan_revision <> p_revision
    or (select count(*) from public.tasks where project_id = p.id) <> 14 then
    raise exception 'Review the latest plan before committing';
  end if;
  select (now() at time zone timezone)::date into first_day from public.profiles where id = p_user_id;
  update public.tasks set scheduled_date = first_day + position - 1 where project_id = p.id;
  update public.projects set status = 'active', committed_at = now(), planned_through = first_day + 13 where id = p.id;
  return p.id;
end;
$$;
revoke all on function public.save_draft_plan(uuid, uuid, integer, jsonb) from public, anon, authenticated;
revoke all on function public.commit_draft_plan(uuid, integer) from public, anon, authenticated;
grant execute on function public.save_draft_plan(uuid, uuid, integer, jsonb) to service_role;
grant execute on function public.commit_draft_plan(uuid, integer) to service_role;
commit;
