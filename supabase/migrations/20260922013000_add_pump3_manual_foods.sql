alter table public.pump3_daily_state
  add column if not exists manual_foods jsonb not null default '[]'::jsonb;

comment on column public.pump3_daily_state.manual_foods is
  'User-confirmed manual food entries for the day. PUMP never invents nutrition values here.';
