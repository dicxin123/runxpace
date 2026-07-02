-- Allow multiple named schedules per user (run in Supabase SQL Editor)

alter table public.training_schedules
  add column if not exists name text not null default 'My Training Plan';

alter table public.training_schedules
  add column if not exists created_at timestamptz not null default now();

alter table public.training_schedules
  drop constraint if exists training_schedules_user_unique;
