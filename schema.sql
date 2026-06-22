-- F.A.R.T. League Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- LEAGUES
create table leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('singles', 'showcase', 'album')),
  round_duration_days int not null default 7,
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  composer_token text not null,
  created_at timestamptz default now()
);

-- MEMBERS
create table members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references leagues(id) on delete cascade,
  display_name text not null,
  browser_token text not null,
  is_composer boolean default false,
  joined_at timestamptz default now(),
  unique(league_id, display_name),
  unique(league_id, browser_token)
);

-- ROUNDS
create table rounds (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references leagues(id) on delete cascade,
  round_number int not null,
  status text not null default 'nominating' check (status in ('nominating', 'voting', 'closed')),
  opens_at timestamptz default now(),
  voting_starts_at timestamptz,
  closes_at timestamptz,
  unique(league_id, round_number)
);

-- NOMINATIONS
create table nominations (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references rounds(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  title text not null,
  artist text not null,
  release_date date not null,
  link text,
  track_count int not null default 1,
  nominated_at timestamptz default now(),
  unique(round_id, title, artist)
);

-- VOTES
create table votes (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references rounds(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  nomination_id uuid references nominations(id) on delete cascade,
  points int not null check (points >= 0),
  voted_at timestamptz default now(),
  unique(round_id, member_id, nomination_id)
);

-- Row Level Security (basic open policy for anon key — fine for friend group)
alter table leagues enable row level security;
alter table members enable row level security;
alter table rounds enable row level security;
alter table nominations enable row level security;
alter table votes enable row level security;

create policy "Allow all for leagues" on leagues for all using (true) with check (true);
create policy "Allow all for members" on members for all using (true) with check (true);
create policy "Allow all for rounds" on rounds for all using (true) with check (true);
create policy "Allow all for nominations" on nominations for all using (true) with check (true);
create policy "Allow all for votes" on votes for all using (true) with check (true);
