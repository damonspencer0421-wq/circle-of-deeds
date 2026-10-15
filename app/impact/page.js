import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 120;

export default async function Impact() {
  const sb = supabase();
  const [{ data: s }, { data: links }, { data: circles }] = await Promise.all([
    sb.from("public_stats").select("*").single(),
    sb.from("links").select("deed_type_id,city,region,points,deed_types(name)").not("accepted_at", "is", null).limit(5000),
    sb.from("circles").select("id,link_count,point_total").order("link_count", { ascending: false }).limit(10),
  ]);
  const count = (arr, key) => { const m = new Map(); for (const l of arr || []) { const k = key(l); if (!k) continue; m.set(k, (m.get(k) || 0) + 1); } return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10); };
  const deeds = count(links, (l) => l.deed_types?.name);
  const places = count(links, (l) => l.city ? `${l.city}${l.region ? ", " + l.region : ""}` : null);
  const states = count(links, (l) => l.region);
  const n = (v) => Number(v || 0).toLocaleString();
  return (
    <main className="wrap" style={{ padding: "28px 20px" }}>
      <div className="eyebrow">Impact</div>
      <h2>The kindness receipts</h2>
      <p className="muted">No individual rankings. Just proof that small things can travel.</p>
      <div className="stats" style={{ marginTop: 14 }}>
        <div className="stat"><div className="n">{n(s?.circles_alive)}</div><div className="l">circles alive this week</div></div>
        <div className="stat"><div className="n">{n((links || []).length)}</div><div className="l">deeds confirmed</div></div>
        <div className="stat"><div className="n">{n(s?.cities_reached)}</div><div className="l">cities</div></div>
        <div className="stat"><div className="n">{n(s?.regions_reached)}</div><div className="l">states</div></div>
        <div className="stat"><div className="n">{n(s?.longest_circle)}</div><div className="l">longest circle</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginTop: 24 }}>
        <div className="card"><h3>Most common deeds</h3>{deeds.length ? deeds.map(([k, v]) => <div className="rank" key={k}><span>{k}</span><b>{v}</b></div>) : <p className="muted small">Nothing yet. Be the first.</p>}</div>
        <div className="card"><h3>Cities</h3>{places.length ? places.map(([k, v]) => <div className="rank" key={k}><span>{k}</span><b>{v}</b></div>) : <p className="muted small">No cities yet.</p>}</div>
        <div className="card"><h3>States</h3>{states.length ? states.map(([k, v]) => <div className="rank" key={k}><span>{k}</span><b>{v}</b></div>) : <p className="muted small">No states yet.</p>}</div>
        <div className="card"><h3>Longest circles</h3>{(circles || []).filter((c) => c.link_count > 0).length ? circles.filter((c) => c.link_count > 0).map((c) => <div className="rank" key={c.id}><Link href={`/circle/${c.id}`}>Circle #{c.id}</Link><b>{c.link_count} links · {c.point_total} pts</b></div>) : <p className="muted small">No circles yet.</p>}</div>
      </div>
      <p className="small muted" style={{ marginTop: 20 }}>Rankings are by reach and links, never by points per person. Locations are city-level only.</p>
    </main>
  );
}
