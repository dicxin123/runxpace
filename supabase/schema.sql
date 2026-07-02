-- Training Schedule App — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query

-- WARNING: drops existing users table and all user data
drop table if exists public.users cascade;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint users_name_lowercase check (name = lower(name)),
  constraint users_name_unique unique (name)
);

create index users_name_idx on public.users (name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

-- Server uses the service role key; keep direct client access locked down
alter table public.users enable row level security;

-- Multiple named schedules per user
create table public.training_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default 'My Training Plan',
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index training_schedules_user_id_idx on public.training_schedules (user_id);

create trigger training_schedules_set_updated_at
  before update on public.training_schedules
  for each row
  execute function public.set_updated_at();

alter table public.training_schedules enable row level security;
