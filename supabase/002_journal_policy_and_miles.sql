-- Run once in the Supabase SQL editor after schema.sql.
-- 1) Let anyone insert a private journal entry (no select policy on purpose: journal stays private).
create policy "anyone can journal" on journal_entries for insert with check (true);
-- 2) Keep circles.miles_total current from coarse cells (~10 mi) on every acceptance.
create or replace function recompute_circle_miles(p_circle bigint) returns void language plpgsql security definer as $$
declare r record; prev text; total numeric := 0; a1 numeric; b1 numeric; a2 numeric; b2 numeric; d numeric;
begin
  prev := null;
  for r in select geo_cell from links where circle_id = p_circle and accepted_at is not null and geo_cell is not null order by id loop
    if prev is not null then
      a1 := split_part(prev,',',1)::numeric; b1 := split_part(prev,',',2)::numeric;
      a2 := split_part(r.geo_cell,',',1)::numeric; b2 := split_part(r.geo_cell,',',2)::numeric;
      d := 2*3958.8*asin(sqrt(power(sin(radians(a2-a1)/2),2)+cos(radians(a1))*cos(radians(a2))*power(sin(radians(b2-b1)/2),2)));
      total := total + d;
    end if;
    prev := r.geo_cell;
  end loop;
  update circles set miles_total = round(total,1) where id = p_circle;
end $$;
create or replace function links_after_accept() returns trigger language plpgsql as $$
begin
  if new.accepted_at is not null and (old.accepted_at is null) then perform recompute_circle_miles(new.circle_id); end if;
  return new;
end $$;
drop trigger if exists links_accept_miles on links;
create trigger links_accept_miles after update on links for each row execute function links_after_accept();
