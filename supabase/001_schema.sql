-- Circle of Deeds: original schema, recovered Oct 18, 2026.
--
-- The first migration was never committed. Production was created from it
-- (the old notes call that file schema.sql). This reconstruction is for a
-- brand-new database only. Do not run it on the live Supabase project.
-- After this file, run 002_journal_policy_and_miles.sql, then 003_app_events.sql.
--
-- How this was built
-- ------------------
-- Confirmed from the app, from 002/003, and from read-only queries against
-- the live project (publishable key, Oct 18, 2026): table and column names,
-- foreign keys that PostgREST will embed, identity/uuid types, the deed
-- catalog, the create_link / accept_link argument lists, and the error
-- strings those functions actually raise.
--
-- The catalog of policies, indexes, and function bodies is not exposed
-- through the publishable key, and the secret key was not available. Every
-- part that is inferred is marked INFERRED below and again on that statement.
-- Those pieces need a check against the live schema (Supabase SQL editor:
-- select pg_get_functiondef(oid) from pg_proc where proname in
-- ('create_link','accept_link'); and \d+ on each table).
--
-- Confirmed behavior baked into the functions
-- -------------------------------------------
-- create_link(p_deed text, p_doer uuid, p_parent bigint default null)
--   * unknown, wrong-case, or journal deed  -> 'deed type not chainable'
--   * p_parent set but missing or not yet accepted -> 'parent link not accepted'
--   * an accepted parent is allowed even after its 24-hour window has closed,
--     and the caller does not have to be that link's recipient (both reached
--     the insert and failed only on the doer guest foreign key)
--   * a new circle is created only when p_parent is null; a continuation
--     stays on the parent's circle (observed: link 5 continues circle 4)
--   * new codes last 24 hours (expires_at = created_at + 24 hours, exact)
-- accept_link(p_code text, p_recipient uuid, p_city text, p_region text, p_cell text)
--   * code match is case-insensitive and ignores dashes
--   * missing code        -> 'no such code'
--   * already accepted    -> 'code already used'   (checked before expiry)
--   * past expires_at     -> 'code expired'
--   * on success, expires_at becomes accepted_at + 24 hours (exact match on
--     every accepted row). The client calls that instant pass_by.
--   * city, region, and geo_cell may all stay null
-- A self-accept ban was not visible: accepting an expired code as its doer
-- still returned 'code expired'. Do not assume the live function has one.
--
-- INFERRED, please verify
-- ------------------------
-- * security definer on create_link and accept_link (anon cannot insert
--   links or circles, but those functions do write them)
-- * policy names, and that guests are world-readable (the rows are; the
--   policy text was not)
-- * circles_alive counts accepted links from the last 7 days. The homepage
--   says "this week". A 24-hour "window still open" definition also fits
--   today's zero. See the view.
-- * founding_signups.email is unique (the form treats a unique violation
--   as success; that error was not triggered here)
-- * reports.reason and reports.status are nullable text with no default
--   and no length check (omitting them still reached the link foreign key)
-- * no self-accept check, and no server-side check that a continuation
--   happens inside the 24-hour window or by the recipient
-- * doer_guest, country, circle status, and the count columns are not null
--   (no nulls in the live rows; the constraints themselves were not listed)
-- * code alphabet includes 6. Live codes never use 0, O, 1, I, or L, which
--   matches the in-app copy. Digit 6 was simply absent from the 17 codes.
-- * index names other than the primary keys and the unique code
-- * link_count / point_total are recomputed inside accept_link rather than
--   by a trigger. 002 owns the miles trigger; this file only adds the column.

begin;

-- ---------------------------------------------------------------------------
-- guests
-- Anonymous browser ids. The app inserts an empty row and stores id locally.
-- ---------------------------------------------------------------------------

create table guests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- INFERRED: present, uuid, nullable, and not a foreign key. No live row
  -- has a value. Likely reserved for a future account claim.
  claimed_by uuid
);

alter table guests enable row level security;

-- INFERRED policy names. Select and insert for anon are confirmed: the app
-- inserts a guest and reads it back, and a direct select returns rows.
create policy "anyone can create a guest"
  on guests for insert
  with check (true);

create policy "guests are readable"
  on guests for select
  using (true);

-- ---------------------------------------------------------------------------
-- deed_types
-- Fixed list. Witnessed deeds can be handed off. Journal deeds stay private
-- and score nothing (the dignity rule).
-- ---------------------------------------------------------------------------

create table deed_types (
  id text primary key,
  name text not null,
  -- INFERRED check: every live row is one of these two values.
  kind text not null check (kind in ('witnessed', 'journal')),
  -- INFERRED check: live points are 0, 1, 2, 3, or 4.
  points integer not null check (points between 0 and 4),
  -- INFERRED: only 'live' was observed. Not restricted, in case a type is retired.
  status text not null default 'live',
  sort integer not null,
  created_at timestamptz not null default now()
);

alter table deed_types enable row level security;

create policy "deed types are readable"
  on deed_types for select
  using (true);

-- Catalog copied from the live table on Oct 18, 2026. Names and points are
-- what /start and /journal render. Timestamps there were all
-- 2026-09-03 18:46:16+00; a fresh database uses now() instead.
insert into deed_types (id, name, kind, points, status, sort) values
  ('held-door', 'Held a door', 'witnessed', 1, 'live', 10),
  ('gave-seat', 'Gave up a seat', 'witnessed', 1, 'live', 20),
  ('let-ahead', 'Let someone go ahead in line', 'witnessed', 1, 'live', 30),
  ('bought-coffee', 'Bought a coffee or drink', 'witnessed', 2, 'live', 40),
  ('helped-bags', 'Helped with bags or luggage', 'witnessed', 2, 'live', 50),
  ('helped-cross', 'Helped someone cross the street', 'witnessed', 2, 'live', 60),
  ('paid-order', 'Paid for the order behind you', 'witnessed', 3, 'live', 70),
  ('returned-item', 'Returned a lost item', 'witnessed', 3, 'live', 80),
  ('jumped-car', 'Helped a stranded driver or jumped a car', 'witnessed', 4, 'live', 90),
  ('flat-tire', 'Changed a flat tire', 'witnessed', 4, 'live', 100),
  ('gave-meal', 'Gave a meal or money to someone unhoused', 'journal', 0, 'live', 200),
  ('visited-sick', 'Visited someone sick or shut in', 'journal', 0, 'live', 210),
  ('donated-clothes', 'Donated clothes to a shelter', 'journal', 0, 'live', 220),
  ('served-kitchen', 'Served at a soup kitchen or shelter', 'journal', 0, 'live', 230),
  ('other', 'Other (describe it)', 'witnessed', 1, 'live', 999);

-- ---------------------------------------------------------------------------
-- circles
-- One row per chain. link_count and point_total count accepted links only.
-- miles_total stays 0 until 002 installs the recompute trigger.
-- ---------------------------------------------------------------------------

create table circles (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  link_count integer not null default 0,
  point_total integer not null default 0,
  miles_total numeric not null default 0,
  -- INFERRED default. Every live circle is 'alive'. Nothing in the app or
  -- the later migrations changes it, including after the 24-hour window.
  status text not null default 'alive'
);

alter table circles enable row level security;

create policy "circles are readable"
  on circles for select
  using (true);

-- ---------------------------------------------------------------------------
-- links
-- One handoff. `code` is stored as six characters, no dash.
-- expires_at is the code deadline, then accept_link moves it to the
-- recipient's pass-on deadline. There is no separate pass_by column.
-- ---------------------------------------------------------------------------

create table links (
  id bigint generated always as identity primary key,
  circle_id bigint not null references circles (id),
  parent_link_id bigint references links (id),
  deed_type_id text not null references deed_types (id),
  points integer not null,
  code text not null unique,
  -- INFERRED not null. Every live link has a doer, and create_link inserts one.
  doer_guest uuid not null references guests (id),
  recipient_guest uuid references guests (id),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  expires_at timestamptz not null,
  -- Confirmed foreign key back to links. No live row uses it, and the app
  -- never reads it. Kept so a fresh database matches production.
  revived_from bigint references links (id),
  geo_cell text,
  city text,
  region text,
  -- INFERRED default. Every live link is 'US'. The app does not send a country.
  country text not null default 'US'
);

create index links_circle_id_idx on links (circle_id);
create index links_parent_link_id_idx on links (parent_link_id);

alter table links enable row level security;

-- Confirmed: anon can read every column, including doer and recipient ids.
-- Anon cannot insert. create_link and accept_link write as security definer.
create policy "links are readable"
  on links for select
  using (true);

-- ---------------------------------------------------------------------------
-- journal_entries
-- Private notes. 002 adds the insert policy on purpose and leaves select off,
-- so this file only creates the table. guest_id, deed_type_id, and note are
-- nullable: an insert that omitted all three was accepted by production.
-- ---------------------------------------------------------------------------

create table journal_entries (
  id bigint generated always as identity primary key,
  guest_id uuid references guests (id),
  deed_type_id text references deed_types (id),
  note text,
  created_at timestamptz not null default now()
);

alter table journal_entries enable row level security;

-- ---------------------------------------------------------------------------
-- founding_signups
-- Homepage email list. Insert only. The app never reads these rows back.
-- ---------------------------------------------------------------------------

create table founding_signups (
  id bigint generated always as identity primary key,
  -- INFERRED unique. The form treats a duplicate/unique error as "you're in".
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table founding_signups enable row level security;

-- INFERRED: no select policy. A select returned no rows, which is also what
-- an empty table would do. Add-only matches the product rule.
create policy "anyone can join the founding list"
  on founding_signups for insert
  with check (true);

-- ---------------------------------------------------------------------------
-- reports
-- Table exists in production. No screen writes to it yet. Insert only.
-- ---------------------------------------------------------------------------

create table reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  -- INFERRED: nullable text, no default, no length check observed.
  reason text,
  link_id bigint not null references links (id),
  -- INFERRED: same as reason.
  status text
);

alter table reports enable row level security;

-- INFERRED: no select policy. Same ambiguity as founding_signups.
create policy "anyone can file a report"
  on reports for insert
  with check (true);

-- ---------------------------------------------------------------------------
-- public_stats
-- One row. The homepage and /impact both select * and expect a single object.
-- Column order matches the live response.
-- ---------------------------------------------------------------------------

-- INFERRED predicate for circles_alive: accepted links in the past 7 days
-- ("this week" on the homepage). Confirm or replace before relying on it.
-- miles_total is the sum of the per-circle totals 002 maintains.
-- cities and regions count accepted links only. longest_circle is the
-- largest circles.link_count, which itself counts accepted links only.
create view public_stats
with (security_invoker = true) as
select
  (
    select count(distinct circle_id)::integer
    from links
    where accepted_at is not null
      and accepted_at > now() - interval '7 days'
  ) as circles_alive,
  coalesce((select sum(miles_total) from circles), 0) as miles_total,
  (
    select count(distinct region)::integer
    from links
    where accepted_at is not null
      and region is not null
  ) as regions_reached,
  (
    select count(distinct city)::integer
    from links
    where accepted_at is not null
      and city is not null
  ) as cities_reached,
  coalesce((select max(link_count) from circles), 0)::integer as longest_circle;

-- ---------------------------------------------------------------------------
-- create_link
-- Called from /start as rpc('create_link', { p_deed, p_doer, p_parent }).
-- Returns the fields the page reads: code, circle_id, link_id, expires_at.
-- ---------------------------------------------------------------------------

create or replace function create_link(
  p_deed text,
  p_doer uuid,
  p_parent bigint default null
)
returns table (
  code text,
  circle_id bigint,
  link_id bigint,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind text;
  v_points integer;
  v_status text;
  v_circle bigint;
  v_code text;
  v_link bigint;
  v_expires timestamptz;
  -- INFERRED alphabet. Excludes 0, O, 1, I, L. Includes 6; see file header.
  v_alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  i integer;
begin
  select d.kind, d.points, d.status
    into v_kind, v_points, v_status
  from deed_types d
  where d.id = p_deed;

  -- status = 'live' is INFERRED. kind = 'witnessed' is confirmed
  -- (the journal deed gave-meal raises this same error).
  if v_kind is distinct from 'witnessed' or v_status is distinct from 'live' then
    raise exception 'deed type not chainable';
  end if;

  if p_parent is not null then
    -- Confirmed: missing and not-yet-accepted parents share this error.
    -- Confirmed: an accepted parent is not rejected for an expired window
    -- or for a doer who is not the recipient.
    select l.circle_id
      into v_circle
    from links l
    where l.id = p_parent
      and l.accepted_at is not null;
    if not found then
      raise exception 'parent link not accepted';
    end if;
  else
    insert into circles default values
      returning id into v_circle;
  end if;

  -- INFERRED generator. Live codes are 6 characters from this alphabet,
  -- stored without a dash. Uniqueness is required; the retry is inferred.
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(
        v_alphabet,
        1 + floor(random() * length(v_alphabet))::integer,
        1
      );
    end loop;
    exit when not exists (select 1 from links l where l.code = v_code);
  end loop;

  v_expires := now() + interval '24 hours';

  insert into links (
    circle_id, parent_link_id, deed_type_id, points, code, doer_guest, expires_at
  ) values (
    v_circle, p_parent, p_deed, v_points, v_code, p_doer, v_expires
  )
  returning id into v_link;

  return query
  select v_code, v_circle, v_link, v_expires;
end;
$$;

-- ---------------------------------------------------------------------------
-- accept_link
-- Called from /d/[code]. Starts the recipient's 24-hour window by moving
-- expires_at forward, and returns that instant as pass_by.
-- ---------------------------------------------------------------------------

create or replace function accept_link(
  p_code text,
  p_recipient uuid,
  p_city text,
  p_region text,
  p_cell text
)
returns table (
  link_id bigint,
  circle_id bigint,
  pass_by timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
  v_circle bigint;
  v_points integer;
  v_accepted timestamptz;
  v_expires timestamptz;
  v_pass timestamptz;
  v_code text;
begin
  -- Confirmed: "4J3-THR" and "4j3thr" both find the code stored as 4J3THR.
  v_code := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));

  -- INFERRED: lock the row so two accepts can't both pass the checks.
  select l.id, l.circle_id, l.points, l.accepted_at, l.expires_at
    into v_id, v_circle, v_points, v_accepted, v_expires
  from links l
  where l.code = v_code
  for update;

  if not found then
    raise exception 'no such code';
  end if;
  -- Confirmed order: a code that is both used and expired raises 'code already used'.
  if v_accepted is not null then
    raise exception 'code already used';
  end if;
  if v_expires <= now() then
    raise exception 'code expired';
  end if;

  v_pass := now() + interval '24 hours';

  update links l
  set recipient_guest = p_recipient,
      accepted_at = now(),
      expires_at = v_pass,
      city = p_city,
      region = p_region,
      geo_cell = p_cell
  where l.id = v_id;

  -- INFERRED mechanism, confirmed result: accepted links are what move the
  -- circle's link_count and point_total. Unaccepted links leave both at 0.
  update circles c
  set link_count = s.n,
      point_total = s.pts
  from (
    select count(*)::integer as n,
           coalesce(sum(l.points), 0)::integer as pts
    from links l
    where l.circle_id = v_circle
      and l.accepted_at is not null
  ) s
  where c.id = v_circle;

  return query
  select v_id, v_circle, v_pass;
end;
$$;

-- ---------------------------------------------------------------------------
-- Privileges
-- Match what the publishable key can do today. Writes to links, circles,
-- and deed_types are rejected for anon; the two functions bypass that.
-- ---------------------------------------------------------------------------

revoke all on guests, deed_types, circles, links, journal_entries, founding_signups, reports, public_stats
  from anon, authenticated;

grant select on guests, deed_types, circles, links, journal_entries, founding_signups, reports, public_stats
  to anon, authenticated;

grant insert on guests, journal_entries, founding_signups, reports
  to anon, authenticated;

grant usage, select on sequence
  journal_entries_id_seq,
  founding_signups_id_seq,
  reports_id_seq
  to anon, authenticated;

grant execute on function create_link(text, uuid, bigint) to anon, authenticated;
grant execute on function accept_link(text, uuid, text, text, text) to anon, authenticated;

commit;
