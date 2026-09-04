import Link from "next/link";
import { supabase } from "@/lib/supabase";
import FoundingForm from "@/components/FoundingForm";

export const revalidate = 60;

async function stats() {
  try {
    const { data } = await supabase().from("public_stats").select("*").single();
    return data || {};
  } catch { return {}; }
}

export default async function Home() {
  const s = await stats();
  const n = (v) => Number(v || 0).toLocaleString();
  return (
    <main>
      <section className="hero"><div className="wrap">
        <div className="eyebrow">A Random Good Deeds Society project</div>
        <h1>One held door.<br /><span style={{ color: "var(--gold-deep)" }}>Seven hundred miles.</span></h1>
        <p className="lede">Do something kind for a stranger, hand it to them with a code, and watch it travel from person to person across the map.</p>
        <div className="cta">
          <Link className="btn gold" href="/start">I just did a deed</Link>
          <Link className="btn ghost" href="/d">Someone gave me a code</Link>
        </div>
        <p className="small muted">Free. No account to receive a deed. No messaging, no tracking.</p>
      </div></section>

      <div className="wrap">
        <div className="stats">
          <div className="stat"><div className="n">{n(s.circles_alive)}</div><div className="l">circles alive this week</div></div>
          <div className="stat"><div className="n">{n(s.cities_reached)}</div><div className="l">cities reached</div></div>
          <div className="stat"><div className="n">{n(s.regions_reached)}</div><div className="l">states reached</div></div>
          <div className="stat"><div className="n">{n(s.longest_circle)}</div><div className="l">links in the longest circle</div></div>
        </div>
      </div>

      <section><div className="wrap">
        <div className="eyebrow">How it works</div>
        <h2>Kindness that keeps moving</h2>
        <div className="stack" style={{ marginTop: 16, maxWidth: 620 }}>
          <div className="card"><h3>1. Do the deed</h3><p className="muted">Hold the door. Buy the coffee. Help with the bags. Then tap one tile and get a code.</p></div>
          <div className="card"><h3>2. Hand it over</h3><p className="muted">They scan the QR or you text the link. No app, no names, no emails. About eight seconds.</p></div>
          <div className="card"><h3>3. They have 24 hours</h3><p className="muted">The clock starts. They do a deed for someone new and pass it on. The circle grows, city by city.</p></div>
        </div>
      </div></section>

      <section><div className="wrap">
        <div className="eyebrow">Why it's safe</div>
        <h2>Built so a stranger can trust it in eight seconds</h2>
        <div className="stack" style={{ marginTop: 16, maxWidth: 620 }}>
          <p><b>No names, no emails.</b> Receiving a deed needs nothing from you.</p>
          <p><b>No messaging, ever.</b> Nobody in a circle can contact anybody else.</p>
          <p><b>City, not location.</b> We keep a rounded area about ten miles wide, never coordinates.</p>
          <p><b>Confirmed, not claimed.</b> A deed only counts when the person who received it accepts it.</p>
          <p><b>Effort, not money.</b> Changing a tire is worth more than a latte. No deed is scored by dollars.</p>
        </div>
      </div></section>

      <section><div className="wrap"><FoundingForm /></div></section>
    </main>
  );
}
