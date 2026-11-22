-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

create table if not exists public.rsvps (
  guest_id           text primary key,             -- matches `id` in src/data/guests.ts
  status             text not null check (status in ('yes', 'maybe', 'no')),
  plus_one           boolean not null default false,
  plus_one_name      text,
  plus_one_photo_url text,
  plus_one_animal    text,
  food               text,
  food_unsure        boolean not null default false,
  email              text,
  reminded_at        timestamptz,
  updated_at         timestamptz not null default now()
);

-- Lock the table down. The app talks to it from the server with the
-- service-role key, which bypasses RLS; nobody else can read or write.
alter table public.rsvps enable row level security;

-- Public bucket for +1 selfies (URLs are random-ish and only shown to guests).
insert into storage.buckets (id, name, public)
values ('plus-ones', 'plus-ones', true)
on conflict (id) do nothing;
