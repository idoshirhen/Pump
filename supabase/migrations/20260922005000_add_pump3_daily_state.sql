create table if not exists public.pump3_daily_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meals jsonb not null default '{}'::jsonb,
  workout jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.pump3_weight_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric(5,2) not null check (weight_kg > 20 and weight_kg < 400),
  created_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.pump3_daily_state enable row level security;
alter table public.pump3_weight_entries enable row level security;

grant select, insert, update, delete on public.pump3_daily_state to authenticated;
grant select, insert, update, delete on public.pump3_weight_entries to authenticated;

create policy "pump3 daily state own rows" on public.pump3_daily_state
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "pump3 weight entries own rows" on public.pump3_weight_entries
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists pump3_weight_entries_user_date_idx
  on public.pump3_weight_entries (user_id, date desc);
