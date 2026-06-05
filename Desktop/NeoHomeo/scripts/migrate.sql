-- NeoHomeo AI - Full Schema Migration
-- Run this in Supabase SQL editor: https://supabase.com/dashboard/project/emutdiiqfhbsfkdnkdfb/sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Role enum
do $$ begin
  create type user_role as enum ('student', 'practitioner', 'educator', 'admin');
exception when duplicate_object then null; end $$;

-- Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role user_role not null default 'student',
  avatar_url text,
  streak_days integer not null default 0,
  xp_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chat threads
create table if not exists chat_threads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'New Chat',
  mode text not null default 'general',
  message_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chat messages
create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Study notes
create table if not exists study_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  content text not null default '',
  tags text[] not null default '{}',
  color text not null default '#4e73df',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Saved remedies
create table if not exists saved_remedies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  remedy_name text not null,
  kingdom text,
  miasm text,
  keynotes text,
  created_at timestamptz not null default now()
);

-- Saved rubrics
create table if not exists saved_rubrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  rubric_path text not null,
  chapter text not null,
  grade integer,
  created_at timestamptz not null default now()
);

-- Saved cases (repertory)
create table if not exists repertory_cases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'Untitled Case',
  patient_age integer,
  patient_sex text,
  chief_complaint text,
  rubric_ids text[] not null default '{}',
  rubric_weights jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Knowledge documents (for RAG)
create table if not exists knowledge_documents (
  id uuid primary key default uuid_generate_v4(),
  source text not null,
  title text not null,
  content text not null,
  author text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Full text search on knowledge docs
create index if not exists knowledge_docs_fts on knowledge_documents using gin(to_tsvector('english', title || ' ' || content));

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create or replace trigger profiles_updated_at before update on profiles for each row execute function update_updated_at();
create or replace trigger chat_threads_updated_at before update on chat_threads for each row execute function update_updated_at();
create or replace trigger study_notes_updated_at before update on study_notes for each row execute function update_updated_at();
create or replace trigger repertory_cases_updated_at before update on repertory_cases for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS policies
alter table profiles enable row level security;
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;
alter table study_notes enable row level security;
alter table saved_remedies enable row level security;
alter table saved_rubrics enable row level security;
alter table repertory_cases enable row level security;
alter table knowledge_documents enable row level security;

-- Profiles: users see and edit only their own
create policy "profiles_select" on profiles for select using (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);

-- Chat threads
create policy "threads_all" on chat_threads for all using (auth.uid() = user_id);

-- Chat messages (via thread ownership)
create policy "messages_select" on chat_messages for select using (
  exists (select 1 from chat_threads where id = thread_id and user_id = auth.uid())
);
create policy "messages_insert" on chat_messages for insert with check (
  exists (select 1 from chat_threads where id = thread_id and user_id = auth.uid())
);
create policy "messages_delete" on chat_messages for delete using (
  exists (select 1 from chat_threads where id = thread_id and user_id = auth.uid())
);

-- Study notes
create policy "notes_all" on study_notes for all using (auth.uid() = user_id);

-- Saved remedies
create policy "remedies_all" on saved_remedies for all using (auth.uid() = user_id);

-- Saved rubrics
create policy "rubrics_all" on saved_rubrics for all using (auth.uid() = user_id);

-- Repertory cases
create policy "cases_all" on repertory_cases for all using (auth.uid() = user_id);

-- Knowledge docs: everyone can read
create policy "knowledge_read" on knowledge_documents for select using (true);
