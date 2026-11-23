-- Spendly database schema.
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- It is safe to run again; it will not delete your data.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type        text not null check (type in ('expense', 'income')),
  category    text not null,
  amount      numeric(14, 2) not null check (amount > 0 and amount <= 1000000000),
  note        text not null default '' check (char_length(note) <= 80),
  date        date not null,
  demo        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

create table if not exists public.settings (
  user_id     uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  budget      numeric(14, 2) not null default 50000 check (budget >= 0),
  currency    text not null default 'INR',
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security: each signed-in user can only touch their own rows.
-- ---------------------------------------------------------------------------
alter table public.transactions enable row level security;
alter table public.settings     enable row level security;

drop policy if exists "Users manage own transactions" on public.transactions;
create policy "Users manage own transactions"
  on public.transactions
  for all
  to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own settings" on public.settings;
create policy "Users manage own settings"
  on public.settings
  for all
  to authenticated
  using      ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
