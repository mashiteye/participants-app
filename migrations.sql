-- ============================================================
-- Participants App — Supabase Schema Migrations
-- Run these in order in the Supabase SQL Editor
-- ============================================================

-- 1. Core tables
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  organizer text,
  program text,
  event_date date,
  days integer default 1,
  mel_question text,
  event_code text,
  created_at timestamptz default now()
);

create table if not exists participants (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  name text not null,
  sex text,
  org text,
  prog text,
  position_title text,
  email text,
  phone text,
  notes text,
  code text,
  day_attended text,
  signature text,      -- legacy base64 (pre-Storage migration)
  reg_type text not null default 'Pre-registration',
  created_at timestamptz default now()
);

create table if not exists attendance (
  id uuid default gen_random_uuid() primary key,
  participant_id uuid references participants(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  day text not null,
  signed_at timestamptz default now(),
  signature_url text
);

-- 2. reg_type constraint
alter table participants
  add column if not exists reg_type text not null default 'Pre-registration';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'participants_reg_type_check'
  ) then
    alter table participants
      add constraint participants_reg_type_check
      check (reg_type in ('Pre-registration', 'Walk-in'));
  end if;
end $$;

-- 3. DB-level duplicate prevention for attendance
-- Run this check FIRST — if it returns rows, clean duplicates before creating the index:
--
-- select event_id, participant_id, day, count(*) as duplicate_count
-- from attendance
-- group by event_id, participant_id, day
-- having count(*) > 1;
--
-- To clean duplicates (keeps most recent per participant+day):
-- delete from attendance where id in (
--   select id from (
--     select id, row_number() over (
--       partition by event_id, participant_id, day order by signed_at desc
--     ) as rn from attendance
--   ) ranked where rn > 1
-- );
--
-- Then create the unique index:
create unique index if not exists attendance_unique_participant_day
  on attendance (event_id, participant_id, day);

-- 4. RLS policies
alter table events enable row level security;
alter table participants enable row level security;
alter table attendance enable row level security;

create policy "public select" on events for select using (true);
create policy "public insert" on events for insert with check (true);
create policy "public update" on events for update using (true);
create policy "public delete" on events for delete using (true);

create policy "public select" on participants for select using (true);
create policy "public insert" on participants for insert with check (true);
create policy "public delete" on participants for delete using (true);

create policy "public insert" on attendance for insert with check (true);
create policy "public select" on attendance for select using (true);

-- 5. Storage — run separately in Supabase Storage UI
-- Create a public bucket named: signatures
-- Then run in SQL Editor:
create policy "public upload signatures"
  on storage.objects for insert
  with check (bucket_id = 'signatures');

create policy "public read signatures"
  on storage.objects for select
  using (bucket_id = 'signatures');
