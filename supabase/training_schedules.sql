-- Add training schedule storage (run in Supabase SQL Editor)
-- Safe to run on an existing project — does not drop the users table

create table if not exists public.training_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default 'My Training Plan',
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.training_schedules
  add column if not exists name text not null default 'My Training Plan';

alter table public.training_schedules
  add column if not exists created_at timestamptz not null default now();

alter table public.training_schedules
  drop constraint if exists training_schedules_user_unique;

create index if not exists training_schedules_user_id_idx
  on public.training_schedules (user_id);

drop trigger if exists training_schedules_set_updated_at on public.training_schedules;

create trigger training_schedules_set_updated_at
  before update on public.training_schedules
  for each row
  execute function public.set_updated_at();

alter table public.training_schedules enable row level security;
