create table if not exists public.user_meal_feedback (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id text not null check (char_length(recipe_id) between 1 and 120),
  feedback text not null check (feedback in ('liked', 'not_for_me', 'too_expensive', 'too_slow', 'still_hungry')),
  updated_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

alter table public.user_meal_feedback enable row level security;

revoke all on table public.user_meal_feedback from public;
revoke all on table public.user_meal_feedback from anon;
grant select, insert, update on table public.user_meal_feedback to authenticated;

drop policy if exists "Users can view their own meal feedback" on public.user_meal_feedback;
drop policy if exists "Users can insert their own meal feedback" on public.user_meal_feedback;
drop policy if exists "Users can update their own meal feedback" on public.user_meal_feedback;

create policy "Users can view their own meal feedback"
  on public.user_meal_feedback
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own meal feedback"
  on public.user_meal_feedback
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own meal feedback"
  on public.user_meal_feedback
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
