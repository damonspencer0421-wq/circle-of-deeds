"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FoundingForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState(null);
  async function submit(e) {
    e.preventDefault();
    setState("saving");
    const { error } = await supabase().from("founding_signups").insert({ email: email.trim().toLowerCase() });
    if (error && !/duplicate|unique/i.test(error.message)) { setState("error"); return; }
    setState("done"); setEmail("");
  }
  return (
    <div className="card" style={{ background: "var(--navy)", color: "#fff", borderColor: "var(--navy)", textAlign: "center", padding: "36px 22px" }}>
      <div className="eyebrow" style={{ color: "var(--gold)" }}>Founding circles</div>
      <h2 style={{ color: "#fff" }}>Start one of the first hundred circles</h2>
      <p style={{ color: "rgba(255,255,255,.8)", maxWidth: 52 + "ch", margin: "10px auto" }}>Leave an email and we'll send your founding code before anyone else has one.</p>
      {state === "done" ? <div className="notice ok">You're in. Watch your inbox.</div> : (
        <form onSubmit={submit} style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
          <input type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ maxWidth: 300, borderRadius: 999 }} aria-label="Email address" />
          <button className="btn gold" disabled={state === "saving"}>Count me in</button>
        </form>
      )}
      {state === "error" && <div className="notice bad" style={{ marginTop: 10 }}>That didn't save. Try again in a moment.</div>}
    </div>
  );
}
