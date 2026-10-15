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
        <div className="hero-grid">
          <div>
            <div className="eyebrow">A Random Good Deeds Society project</div>
            <h1>Kindness has legs.<br /><span style={{ color: "var(--gold-deep)" }}>Let’s see how far it gets.</span></h1>
            <p className="lede">Do one good thing. Hand off a code. Watch that small moment travel from stranger to stranger.</p>
            <div className="cta">
              <Link className="btn gold" href="/start">I just did a good deed</Link>
              <Link className="btn ghost" href="/d">I got a code</Link>
            </div>
            <p className="small muted">Free. No account. No inbox. No leaderboard of saints.</p>
          </div>
          <div className="spark-card" aria-label="How a circle moves">
            <div className="spark-step"><span>1</span><b>You do a kind thing</b><small>Look at you go.</small></div>
            <div className="spark-line" />
            <div className="spark-step"><span>2</span><b>They accept it</b><small>One tap. Zero awkwardness.</small></div>
            <div className="spark-line" />
            <div className="spark-step"><span>3</span><b>They pass it on</b><small>Now it has a story.</small></div>
          </div>
        </div>
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
        <div className="eyebrow">The tiny challenge</div>
        <h2>Good deeds should not just sit there looking pleased with themselves.</h2>
        <div className="how-grid" style={{ marginTop: 22 }}>
          <div className="card playful-card"><span className="card-number">01</span><h3>Do something kind</h3><p className="muted">Hold a door. Help with bags. Rescue a shopping cart from a life of crime.</p></div>
          <div className="card playful-card"><span className="card-number">02</span><h3>Hand over the spark</h3><p className="muted">Text a link or show the QR. They need no app, name, or email.</p></div>
          <div className="card playful-card"><span className="card-number">03</span><h3>Keep the circle alive</h3><p className="muted">They get 24 hours to help somebody new. Then the story grows another link.</p></div>
        </div>
      </div></section>

      <section><div className="wrap">
        <div className="eyebrow">Kind, not creepy</div>
        <h2>Built for trust—not oversharing.</h2>
        <div className="trust-grid" style={{ marginTop: 20 }}>
          <div><b>🙅 No names or emails</b><span>Receiving a deed requires neither.</span></div>
          <div><b>💬 No messaging, ever</b><span>Nobody in a circle can contact anybody else.</span></div>
          <div><b>📍 City-level only</b><span>Your exact location is never stored.</span></div>
          <div><b>🤝 Confirmed by the recipient</b><span>A deed counts only when it really lands.</span></div>
          <div><b>💪 Effort, not dollars</b><span>Kindness is not a spending contest.</span></div>
          <div><b>🫶 Dignity first</b><span>Sensitive deeds stay private and unscored.</span></div>
        </div>
      </div></section>

      <section><div className="wrap"><FoundingForm /></div></section>
    </main>
  );
}
