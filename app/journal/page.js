"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getGuestId } from "@/lib/guest";

const KEY = "cod_journal";
function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} }

export default function Journal() {
  const [types, setTypes] = useState([]);
  const [note, setNote] = useState("");
  const [type, setType] = useState("");
  const [entries, setEntries] = useState([]);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    supabase().from("deed_types").select("id,name,kind,sort").order("sort").then(({ data }) => setTypes(data || []));
    setEntries(load());
  }, []);
  async function add(e) {
    e.preventDefault();
    if (!type) return;
    const t = types.find((x) => x.id === type);
    const entry = { id: Date.now(), type: t?.name || type, note: note.trim(), at: new Date().toISOString() };
    const next = [entry, ...entries]; setEntries(next); save(next);
    try { const guest = await getGuestId(); await supabase().from("journal_entries").insert({ guest_id: guest, deed_type_id: type, note: entry.note || null }); } catch {}
    setNote(""); setType(""); setMsg("Logged. This stays private to you.");
  }
  return (
    <main className="narrow" style={{ padding: "28px 20px" }}>
      <div className="eyebrow">Private journal</div>
      <h2>Deeds nobody needs to see</h2>
      <p className="muted">For the deeds where the other person can't or shouldn't be tagged. These never score and are never public. They're yours.</p>
      <form onSubmit={add} className="stack card">
        <select value={type} onChange={(e) => setType(e.target.value)} required aria-label="Deed">
          <option value="">What did you do?</option>
          {types.map((t) => <option key={t.id} value={t.id}>{t.name}{t.kind === "journal" ? "" : " (witnessed)"}</option>)}
        </select>
        <textarea rows={3} placeholder="A line for yourself. Optional." value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn gold block">Log it</button>
        {msg && <div className="notice ok">{msg}</div>}
      </form>
      <div className="stack" style={{ marginTop: 16 }}>
        {entries.map((e) => (
          <div className="card" key={e.id}><b>{e.type}</b><div className="small muted">{new Date(e.at).toLocaleDateString()}</div>{e.note && <p style={{ margin: "6px 0 0" }}>{e.note}</p>}</div>
        ))}
      </div>
    </main>
  );
}
