create table if not exists public.pump3_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pump3_profiles enable row level security;

create policy "pump3_profiles_select_own"
on public.pump3_profiles for select
to authenticated
using (auth.uid() = user_id);

create policy "pump3_profiles_insert_own"
on public.pump3_profiles for insert
to authenticated
with check (auth.uid() = user_id);

create policy "pump3_profiles_update_own"
on public.pump3_profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.set_pump3_profiles_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pump3_profiles_set_updated_at on public.pump3_profiles;
create trigger pump3_profiles_set_updated_at
before update on public.pump3_profiles
for each row execute function public.set_pump3_profiles_updated_at();
