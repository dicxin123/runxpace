-- Migrate users table from email to name (run in Supabase SQL Editor)
-- Safe for existing projects that already have an email column

alter table public.users rename column email to name;

alter table public.users drop constraint if exists users_email_lowercase;
alter table public.users drop constraint if exists users_email_unique;

drop index if exists public.users_email_idx;

alter table public.users
  add constraint users_name_lowercase check (name = lower(name));

alter table public.users
  add constraint users_name_unique unique (name);

create index if not exists users_name_idx on public.users (name);
