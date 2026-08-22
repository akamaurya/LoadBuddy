-- Baseline schema: one profile row per authenticated user.
-- Reconstructed from the deployed database so a fresh project can be stood up
-- with `supabase db push`.

create table if not exists public.profiles (
  id                       uuid primary key references auth.users (id) on delete cascade,
  email                    text,
  start_date               date        not null default current_date,
  cycle_length_weeks       integer     not null default 4,
  deload_length_weeks      integer     not null default 1,
  timezone                 text        not null default 'UTC',
  notification_hour        integer     not null default 20,
  notification_days_before integer     not null default 1,
  created_at               timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;

-- Every policy is scoped to the caller's own row; the notify edge function
-- reads the table with the service role key, which bypasses RLS.
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete using (auth.uid() = id);

-- Backs the "Delete Account" button. SECURITY DEFINER so a signed-in user can
-- remove their own auth.users row; the profiles row goes with it via cascade.
create or replace function public.delete_user()
returns void
language sql
security definer
as $$
  delete from auth.users where id = auth.uid();
$$;
