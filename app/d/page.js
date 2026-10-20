"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { codeEntryMessage, normalizeDeedCode } from "@/lib/codeEntry";

export default function EnterCode() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(null);
  const router = useRouter();
  function go(e) {
    e.preventDefault();
    const problem = codeEntryMessage(code);
    if (problem) { setMessage(problem); return; }
    setMessage(null);
    router.push(`/d/${normalizeDeedCode(code)}`);
  }
  return (
    <main className="narrow" style={{ padding: "28px 20px" }}>
      <div className="eyebrow">Got a code?</div>
      <h2>Type it in</h2>
      <p className="muted">Six letters and numbers, like <span style={{ fontFamily: "var(--mono)" }}>7K3-MDP</span>. The dash doesn't matter.</p>
      <form onSubmit={go} className="stack">
        <input value={code} onChange={(e) => { setCode(e.target.value); if (message) setMessage(null); }} placeholder="7K3-MDP" autoCapitalize="characters" autoComplete="off" style={{ fontFamily: "var(--mono)", fontSize: 26, letterSpacing: ".12em", textAlign: "center" }} aria-label="Deed code" aria-invalid={message ? true : undefined} aria-describedby={message ? "code-entry-message" : undefined} />
        {message && <div id="code-entry-message" className="notice code-hint" role="alert">{message}</div>}
        <button className="btn gold block">Open it</button>
      </form>
    </main>
  );
}
