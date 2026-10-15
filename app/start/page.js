"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getGuestId, openLink } from "@/lib/guest";
import { track } from "@/lib/analytics";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://circleofdeeds.app";
const fmt = (c) => c.slice(0, 3) + "-" + c.slice(3);
const EMOJI = { "held-door": "🚪", "gave-seat": "🪑", "let-ahead": "🙌", "bought-coffee": "☕", "helped-bags": "🛍️", "helped-cross": "🚶", "paid-order": "🧾", "returned-item": "🔎", "jumped-car": "🚗", "flat-tire": "🛞", other: "✨" };

export default function Start() {
  const [types, setTypes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [made, setMade] = useState(null); // {code, circle_id, link_id, expires_at, deed}
  const [qr, setQr] = useState(null);
  const [parent, setParent] = useState(null);
  const [accepted, setAccepted] = useState(null); // {city, region} once the stranger accepts

  // Watch the code until the other person accepts it.
  useEffect(() => {
    if (!made || accepted) return;
    const id = setInterval(async () => {
      const { data } = await supabase().from("links").select("accepted_at,city,region").eq("id", made.link_id).maybeSingle();
      if (data && data.accepted_at) { setAccepted({ city: data.city, region: data.region }); clearInterval(id); }
    }, 4000);
    return () => clearInterval(id);
  }, [made, accepted]);

  useEffect(() => {
    supabase().from("deed_types").select("id,name,points,kind,sort").eq("kind", "witnessed").order("sort").then(({ data }) => setTypes(data || []));
    const o = openLink();
    if (o && o.passBy && new Date(o.passBy).getTime() > Date.now()) setParent(o);
  }, []);

  async function pick(t) {
    setBusy(true); setErr(null);
    try {
      const guest = await getGuestId();
      const { data, error } = await supabase().rpc("create_link", { p_deed: t.id, p_doer: guest, p_parent: parent ? parent.linkId : null });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      const url = `${SITE}/d/${row.code}`;
      setQr(await QRCode.toDataURL(url, { width: 400, margin: 1, errorCorrectionLevel: "M" }));
      setAccepted(null);
      setMade({ ...row, deed: t.name, url });
      track("link_created", { linkId: row.link_id, circleId: row.circle_id, metadata: { deed: t.id, extends_circle: Boolean(parent) } });
    } catch (e) { setErr(e.message || "Something went wrong."); }
    setBusy(false);
  }

  async function share() {
    track("share_started", { linkId: made.link_id, circleId: made.circle_id });
    if (navigator.share) {
      try { await navigator.share({ title: "Keep it going", text: `Someone just did something kind for you. Keep it going: ${made.url}`, url: made.url }); } catch {}
    } else { try { await navigator.clipboard.writeText(made.url); alert("Link copied."); } catch {} }
  }

  if (made) return (
    <main className="narrow" style={{ padding: "28px 20px" }}>
      {accepted ? (
        <div className="notice ok" style={{ textAlign: "center", padding: 18, fontSize: 18 }}>
          <b>It landed!</b> Someone{accepted.city ? ` near ${accepted.city}` : ""} accepted your deed. Their 24 hours just started.
        </div>
      ) : (
        <div className="notice" style={{ background: "var(--gold-soft)", color: "var(--gold-deep)", textAlign: "center", fontWeight: 600 }}>
          One tiny handoff left: ask them to open and accept it now.
        </div>
      )}
      <div className="eyebrow" style={{ marginTop: 14 }}>{made.deed}</div>
      <h2>Hand over the spark</h2>
      <div className="stack" style={{ marginTop: 12 }}>
        <button className="btn gold block big-action" onClick={share}>Text them the link</button>
        <p className="small muted" style={{ textAlign: "center", margin: 0 }}>or do the futuristic thing and let them scan it</p>
      </div>
      <div className="codebox" style={{ marginTop: 12 }}>
        <img src={qr} alt={"QR code for " + made.url} />
        <div className="code">{fmt(made.code)}</div>
        <p className="small muted">They can also type this code at circleofdeeds.app. Valid 24 hours.</p>
      </div>
      <div className="stack" style={{ marginTop: 14 }}>
        <Link className="btn ghost block" href={`/circle/${made.circle_id}`}>See this circle</Link>
        <button className="btn ghost sm block" onClick={() => setMade(null)}>Do another deed</button>
      </div>
    </main>
  );

  return (
    <main className="narrow" style={{ padding: "28px 20px" }}>
      <div className="eyebrow">{parent ? "The circle continues" : "Start a circle"}</div>
      <h2>What good thing just happened?</h2>
      <p className="muted">{parent ? "Nice. Pick it below and keep your circle rolling." : "Pick the closest match. This is not paperwork—promise."}</p>
      {err && <div className="notice bad">{err}</div>}
      <div className="tiles" style={{ marginTop: 12 }}>
        {types.map((t) => (
          <button className="tile" key={t.id} disabled={busy} onClick={() => pick(t)}>
            <span><span className="deed-emoji" aria-hidden="true">{EMOJI[t.id] || EMOJI.other}</span>{t.name}</span><span className="pt">{t.points} pt{t.points === 1 ? "" : "s"}</span>
          </button>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 14 }}>Deeds where the other person can't be tagged (like helping someone unhoused) go in your <Link href="/journal">private journal</Link>.</p>
    </main>
  );
}
