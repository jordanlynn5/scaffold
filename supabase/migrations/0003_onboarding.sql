-- The goal being designed with Alice, and the chat it is designed in.
-- spec.md > Data Model (projects, conversations, messages)

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'onboarding'
    check (status in ('onboarding', 'draft_plan', 'active', 'complete')),
  wish text,
  experience text,
  outcome text,
  obstacle text,
  if_then_plans jsonb not null default '[]',
  -- The question Alice is waiting on. 'done' means every answer is in.
  onboarding_step text not null default 'name'
    check (onboarding_step in
      ('name', 'nudge_time', 'days', 'wish', 'experience', 'outcome', 'obstacle', 'done')),
  planned_through date,
  committed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- One goal at a time (prd.md > Product Decisions). Finished houses don't count.
create unique index projects_one_current_per_person
  on public.projects (user_id) where status <> 'complete';

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Empty before a goal exists. Deleting a project deletes its chats.
  project_id uuid references public.projects (id) on delete cascade,
  kind text not null check (kind in ('onboarding', 'team', 'goal_finder')),
  created_at timestamptz not null default now()
);

create index conversations_user_id on public.conversations (user_id);
create index conversations_project_id on public.conversations (project_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender text not null
    check (sender in ('user', 'alice', 'georgina', 'paula', 'sarah', 'system')),
  body text not null,
  kind text not null default 'text' check (kind in ('text', 'join', 'proposal')),
  -- The quick replies offered with a teammate's message.
  chips text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index messages_conversation_id on public.messages (conversation_id, created_at);

-- Row-level security: a logged-in person can read only their own rows.
-- Nobody writes from the browser. The server saves every answer and message.
alter table public.projects enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Read own projects" on public.projects
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Read own conversations" on public.conversations
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Read own messages" on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

revoke insert, update, delete on public.projects from authenticated, anon;
revoke insert, update, delete on public.conversations from authenticated, anon;
revoke insert, update, delete on public.messages from authenticated, anon;
