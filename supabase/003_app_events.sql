-- Privacy-safe funnel events for measuring whether real handoffs continue.
-- No names, emails, journal notes, or precise locations belong in this table.
create table if not exists app_events (
  id bigint generated always as identity primary key,
  event_name text not null check (char_length(event_name) between 1 and 80),
  guest_id text,
  link_id text,
  circle_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_events_name_created_idx on app_events (event_name, created_at desc);
create index if not exists app_events_circle_idx on app_events (circle_id) where circle_id is not null;

alter table app_events enable row level security;
drop policy if exists "anyone can record app events" on app_events;
create policy "anyone can record app events" on app_events for insert with check (true);

revoke all on app_events from anon, authenticated;
grant insert on app_events to anon, authenticated;
grant usage, select on sequence app_events_id_seq to anon, authenticated;
