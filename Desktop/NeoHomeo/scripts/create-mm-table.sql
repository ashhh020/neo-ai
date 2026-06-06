-- ============================================================
-- NeoHomeo: Materia Medica Table (all authors)
-- Sources: materiamedica.info (public domain books, pre-1923)
-- Run this ONCE in Supabase SQL Editor BEFORE running the seeder
-- ============================================================

create table if not exists public.mm_remedies (
  id            text primary key,          -- "{abbrev}_{slug}" e.g. "allen_aconitum-napellus"
  abbrev        text not null,             -- author abbrev: allen | boericke | kent | clarke | bogsk
  remedy_slug   text not null,             -- URL slug from source
  remedy_abbrev text,                      -- short remedy abbreviation e.g. "Acon."
  name          text not null,             -- full remedy name
  intro         text,                      -- first paragraph / intro text
  sections      jsonb not null default '{}', -- {heading: text} sections
  category      text not null default 'plant', -- plant | mineral | animal | nosode
  author        text not null,             -- full author name
  title         text not null,             -- book title
  year          int,                       -- publication year
  source_url    text                       -- original URL
);

-- Indexes
create index if not exists idx_mm_abbrev    on public.mm_remedies(abbrev);
create index if not exists idx_mm_category  on public.mm_remedies(category);
create index if not exists idx_mm_name_fts  on public.mm_remedies using gin(to_tsvector('english', name || ' ' || coalesce(intro, '')));
create index if not exists idx_mm_slug      on public.mm_remedies(remedy_slug);

-- Composite: author + remedy (for cross-author lookup)
create index if not exists idx_mm_abbrev_slug on public.mm_remedies(abbrev, remedy_slug);

-- RLS: public read
alter table public.mm_remedies enable row level security;

drop policy if exists "Public read mm" on public.mm_remedies;
create policy "Public read mm"
  on public.mm_remedies for select using (true);
