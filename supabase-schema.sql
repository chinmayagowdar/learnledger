-- ============================================================
-- LearnLedger — Supabase Schema
-- Run this in your Supabase SQL Editor (Database → SQL Editor)
-- ============================================================

-- 1. Profiles (mirrors auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  avatar_url  text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- 2. User Assessments (tracks progress per user per assessment)
create table if not exists public.user_assessments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  assessment_id  text not null,
  status         text not null check (status in ('pending','in-progress','completed')),
  score          integer,
  completed_at   timestamptz,
  created_at     timestamptz default now(),
  unique (user_id, assessment_id)
);

alter table public.user_assessments enable row level security;

create policy "Users can manage own assessments"
  on public.user_assessments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 3. Credentials (earned blockchain credentials)
create table if not exists public.credentials (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  issuer           text not null,
  credential_id    text not null unique,
  blockchain_hash  text not null,
  date             text not null,
  assessment_id    text not null,
  score            integer not null,
  is_verified      boolean default true,
  views            integer default 0,
  share_count      integer default 0,
  created_at       timestamptz default now()
);

alter table public.credentials enable row level security;

create policy "Users can view own credentials"
  on public.credentials for select
  using (auth.uid() = user_id);

create policy "Users can insert own credentials"
  on public.credentials for insert
  with check (auth.uid() = user_id);

create policy "Public can view credentials for verification"
  on public.credentials for select
  using (true);

-- RPC to safely increment views
create or replace function increment_credential_views(cred_id uuid)
returns void language sql security definer as $$
  update public.credentials
  set views = views + 1
  where id = cred_id;
$$;


-- 4. Round Results (per-round quiz scores)
create table if not exists public.round_results (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  assessment_id  text not null,
  round          integer not null check (round between 1 and 3),
  score          integer not null,
  total          integer not null,
  percentage     integer not null,
  passed         boolean not null,
  created_at     timestamptz default now()
);

alter table public.round_results enable row level security;

create policy "Users can manage own round results"
  on public.round_results for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================
-- Auto-create profile on signup via trigger
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || encode(new.id::text::bytea, 'hex')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
