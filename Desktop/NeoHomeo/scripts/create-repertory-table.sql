-- ============================================================
-- NeoHomeo: Repertory Table (Kent/Publicum — 74,667 rubrics)
-- Source: OOREP open source project (GPL-3.0)
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

create table if not exists public.repertory_rubrics (
  id          text primary key,
  abbrev      text not null default 'publicum',
  chapter     text not null,
  fullpath    text not null,
  path        text,
  is_mother   boolean default false,
  mother_id   text,
  remedies    jsonb not null default '[]'::jsonb
);

-- Fast chapter filter
create index if not exists idx_rep_chapter
  on public.repertory_rubrics(chapter);

-- Full-text search on the path/fullpath
create index if not exists idx_rep_fts
  on public.repertory_rubrics
  using gin(to_tsvector('english', fullpath));

-- Remedy lookup (find rubrics containing a remedy)
create index if not exists idx_rep_remedies
  on public.repertory_rubrics using gin(remedies);

-- RLS — public read, no auth needed
alter table public.repertory_rubrics enable row level security;

drop policy if exists "Public read repertory" on public.repertory_rubrics;
create policy "Public read repertory"
  on public.repertory_rubrics for select using (true);
