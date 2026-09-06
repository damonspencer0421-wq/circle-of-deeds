"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getGuestId, rememberLink } from "@/lib/guest";
import { coarseLocate } from "@/lib/geo";
import Countdown from "@/components/Countdown";

const VERB = { "held-door": "held the door for you", "gave-seat": "gave up a seat for you", "let-ahead": "let you go ahead in line", "bought-coffee": "bought you a coffee", "helped-bags": "helped with your bags", "helped-cross": "helped you cross the street", "paid-order": "paid for your order", "returned-item": "returned something you lost", "jumped-car": "helped you when you were stranded", "flat-tire": "changed your flat tire" };

export default function Receive() {
  const { code } = useParams();
  const clean = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const [link, setLink] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | used | expired | missing | accepting | accepted | declined
  const [loc, setLoc] = useState(null);
  const [city, setCity] = useState("");
  const [done, setDone] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    supabase().from("links").select("id,circle_id,deed_type_id,points,accepted_at,expires_at,city,region,parent_link_id,deed_types(name)").eq("code", clean).maybeSingle()
      .then(({ data }) => {
        if (!data) { setState("missing"); return; }
        setLink(data);
        if (data.accepted_at) setState("used");
        else if (new Date(data.expires_at).getTime() < Date.now()) setState("expired");
        else setState("ready");
      });
  }, [clean]);

  const [locating, setLocating] = useState(false);
  async function locate() {
    setLocating(true);
    const l = await coarseLocate();
    if (l) { setLoc(l); if (l.city) setCity(l.city + (l.region ? ", " + l.region : "")); }
    setLocating(false);
  }
  // Ask for the coarse area as soon as the deed is ready, so nobody has to find the button.
  useEffect(() => { if (state === "ready" && !loc && !city) locate(); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  async function accept() {
    setState("accepting"); setErr(null);
    try {
      const guest = await getGuestId();
      let c = null, r = null;
      if (city.trim()) { const parts = city.split(","); c = parts[0].trim(); r = (parts[1] || "").trim() || (loc && loc.region) || null; }
      const { data, error } = await supabase().rpc("accept_link", { p_code: clean, p_recipient: guest, p_city: c, p_region: r, p_cell: loc ? loc.cell : null });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      rememberLink(row.link_id, row.circle_id, row.pass_by);
      setDone(row); setState("accepted");
    } catch (e) { setErr(e.message || "That didn't work."); setState("ready"); }
  }

  const origin = link ? (link.parent_link_id ? null : null) : null;
  const verb = link ? (VERB[link.deed_type_id] || "did something kind for you") : "";

  if (state === "loading") return <main className="narrow" style={{ padding: 40 }}><p className="muted">Opening your deed…</p></main>;
  if (state === "missing") return <main className="narrow" style={{ padding: 40 }}><h2>No deed with that code</h2><p className="muted">Check the letters and try again. Codes never use 0, O, 1, I or L.</p><Link className="btn ghost" href="/d">Try another code</Link></main>;
  if (state === "used") return <main className="narrow" style={{ padding: 40 }}><h2>This one's already been accepted</h2><p className="muted">Each code can be accepted once. If this was yours, the other person already has it. You can still start your own circle.</p><Link className="btn gold" href="/start">Start a circle</Link></main>;
  if (state === "expired") return <main className="narrow" style={{ padding: 40 }}><h2>This code went quiet</h2><p className="muted">Codes last 24 hours. The kindness still happened; start a new circle with it.</p><Link className="btn gold" href="/start">Start a circle</Link></main>;

  if (state === "accepted") return (
    <main className="narrow" style={{ padding: "28px 20px" }}>
      <Countdown until={done.pass_by} />
      <p className="muted" style={{ textAlign: "center" }}>You're in circle #{done.circle_id}. Do something kind for someone new, then pass it on.</p>
      <div className="stack" style={{ marginTop: 16 }}>
        <Link className="btn gold block" href="/start">I did a deed. Pass it on</Link>
        <Link className="btn ghost block" href={`/circle/${done.circle_id}`}>See how far this circle has gone</Link>
      </div>
      <p className="small muted" style={{ marginTop: 16 }}>Save this page or add it to your home screen. There's no account; this browser is your key.</p>
    </main>
  );

  return (
    <main className="narrow" style={{ padding: "28px 20px" }}>
      <div className="receive">
        <div className="from">You just received a deed</div>
        <h2 style={{ marginTop: 6 }}>Someone {verb}{link.city ? ` near ${link.city}` : ""}.</h2>
        <p className="muted">They asked you to keep it going. No account. No name. Just a 24-hour clock.</p>
      </div>
      <div className="stack" style={{ marginTop: 14 }}>
        <label className="small muted">Your area (city only, never your exact spot). This is how the circle measures miles.</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={locating ? "Finding your area…" : "Fort Worth, TX"} />
          <button className="btn ghost sm" type="button" onClick={locate} disabled={locating}>{locating ? "…" : "Find it"}</button>
        </div>
        {err && <div className="notice bad">{err}</div>}
        <button className="btn gold block" onClick={accept} disabled={state === "accepting"}>Accept &amp; keep it going</button>
        <button className="btn ghost sm block" onClick={() => setState("declined")}>No thanks</button>
        {state === "declined" && <div className="notice ok">That's allowed. The kindness still counts for them.</div>}
      </div>
    </main>
  );
}
