"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EnterCode() {
  const [code, setCode] = useState("");
  const router = useRouter();
  function go(e) { e.preventDefault(); const c = code.toUpperCase().replace(/[^A-Z0-9]/g, ""); if (c.length === 6) router.push(`/d/${c}`); }
  return (
    <main className="narrow" style={{ padding: "28px 20px" }}>
      <div className="eyebrow">Got a code?</div>
      <h2>Type it in</h2>
      <p className="muted">Six letters and numbers, like <span style={{ fontFamily: "var(--mono)" }}>7K3-MDP</span>. The dash doesn't matter.</p>
      <form onSubmit={go} className="stack">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="7K3-MDP" autoCapitalize="characters" autoComplete="off" style={{ fontFamily: "var(--mono)", fontSize: 26, letterSpacing: ".12em", textAlign: "center" }} aria-label="Deed code" />
        <button className="btn gold block">Open it</button>
      </form>
    </main>
  );
}
