"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { openLink } from "@/lib/guest";
import Chain from "@/components/Chain";

export default function Circle() {
  const { id } = useParams();
  const [links, setLinks] = useState(null);
  const [mine, setMine] = useState(null);
  useEffect(() => {
    supabase().from("links").select("id,deed_type_id,points,accepted_at,city,region,geo_cell,created_at,deed_types(name)").eq("circle_id", id).order("id").then(({ data }) => setLinks(data || []));
    const o = openLink(); if (o && String(o.circleId) === String(id)) setMine(o.linkId);
  }, [id]);
  async function share() {
    const url = `${location.origin}/circle/${id}`;
    if (navigator.share) { try { await navigator.share({ title: `Circle #${id}`, text: "Look how far one act of kindness traveled.", url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); alert("Link copied."); } catch {} }
  }
  return (
    <main className="narrow" style={{ padding: "28px 20px" }}>
      <div className="eyebrow">Circle #{id}</div>
      <h2>Where it's been</h2>
      {links === null ? <p className="muted">Loading…</p> : links.length === 0 ? <p className="muted">No circle with that number.</p> : <div className="card" style={{ marginTop: 12 }}><Chain links={links} youLinkId={mine} /></div>}
      <div className="stack" style={{ marginTop: 14 }}>
        <button className="btn ghost block" onClick={share}>Share this circle</button>
        <Link className="btn gold block" href="/start">Pass it on</Link>
      </div>
    </main>
  );
}
