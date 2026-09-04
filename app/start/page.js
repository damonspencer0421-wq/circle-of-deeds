"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getGuestId, openLink } from "@/lib/guest";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://circleofdeeds.app";
const fmt = (c) => c.slice(0, 3) + "-" + c.slice(3);

export default function Start() {
  const [types, setTypes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [made, setMade] = useState(null); // {code, circle_id, link_id, expires_at, deed}
  const [qr, setQr] = useState(null);
  const [parent, setParent] = useState(null);

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
      setMade({ ...row, deed: t.name, url });
    } catch (e) { setErr(e.message || "Something went wrong."); }
    setBusy(false);
  }

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: "Keep it going", text: `Someone just did something kind for you. Keep it going: ${made.url}`, url: made.url }); } catch {}
    } else { try { await navigator.clipboard.writeText(made.url); alert("Link copied."); } catch {} }
  }

  if (made) return (
    <main className="narrow" style={{ padding: "28px 20px" }}>
      <div className="eyebrow">Show them this</div>
      <h2>{made.deed}</h2>
      <p className="muted">They scan it with their camera, or you send the link. No app needed on their side.</p>
      <div className="codebox">
        <img src={qr} alt={"QR code for " + made.url} />
        <div className="code">{fmt(made.code)}</div>
        <p className="small muted">Read it aloud if you have to. Valid 24 hours.</p>
      </div>
      <div className="stack" style={{ marginTop: 14 }}>
        <button className="btn gold block" onClick={share}>Send the link</button>
        <Link className="btn ghost block" href={`/circle/${made.circle_id}`}>See this circle</Link>
        <button className="btn ghost sm block" onClick={() => setMade(null)}>Do another deed</button>
      </div>
    </main>
  );

  return (
    <main className="narrow" style={{ padding: "28px 20px" }}>
      <div className="eyebrow">{parent ? "Passing it on" : "Start a circle"}</div>
      <h2>What did you just do?</h2>
      <p className="muted">{parent ? "This deed extends the circle you're in." : "Pick the deed. Points reflect effort, never money."}</p>
      {err && <div className="notice bad">{err}</div>}
      <div className="tiles" style={{ marginTop: 12 }}>
        {types.map((t) => (
          <button className="tile" key={t.id} disabled={busy} onClick={() => pick(t)}>
            {t.name}<span className="pt">{t.points} pt{t.points === 1 ? "" : "s"}</span>
          </button>
        ))}
      </div>
      <p className="small muted" style={{ marginTop: 14 }}>Deeds where the other person can't be tagged (like helping someone unhoused) go in your <Link href="/journal">private journal</Link>.</p>
    </main>
  );
}
