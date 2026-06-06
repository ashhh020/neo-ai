-- ============================================================
-- NeoHomeo: Case Files System (mirrors OOREP's File+Caze model)
-- Run in Supabase SQL Editor
-- ============================================================

-- Files: top-level containers (a user can have many files)
create table if not exists public.case_files (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Cases: inside a file, multiple cases
create table if not exists public.cases (
  id          uuid primary key default gen_random_uuid(),
  file_id     uuid not null references public.case_files(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Case rubrics: each rubric added to a case
create table if not exists public.case_rubrics (
  id              uuid primary key default gen_random_uuid(),
  case_id         uuid not null references public.cases(id) on delete cascade,
  rubric_id       text not null,          -- references repertory_rubrics.id
  rubric_fullpath text not null,          -- denormalized for display
  rubric_chapter  text not null,
  rubric_remedies jsonb not null default '[]',  -- snapshot of remedies at time of adding
  repertory_abbrev text not null default 'publicum',
  weight          int not null default 1 check (weight between 1 and 3),
  label           text,                   -- optional custom label
  created_at      timestamptz default now()
);

-- Indexes
create index if not exists idx_case_files_user on public.case_files(user_id);
create index if not exists idx_cases_file      on public.cases(file_id);
create index if not exists idx_cases_user      on public.cases(user_id);
create index if not exists idx_case_rubrics_case on public.case_rubrics(case_id);

-- RLS
alter table public.case_files  enable row level security;
alter table public.cases        enable row level security;
alter table public.case_rubrics enable row level security;

-- Users own their data
create policy "Own case files" on public.case_files  for all using (auth.uid() = user_id);
create policy "Own cases"      on public.cases        for all using (auth.uid() = user_id);
create policy "Own rubrics"    on public.case_rubrics for all using (
  case_id in (select id from public.cases where user_id = auth.uid())
);
