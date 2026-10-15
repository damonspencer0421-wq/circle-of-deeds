"use client";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

const PLAN_KEY = "cod_next_deed_plan";
const IDEAS = [
  { emoji: "🚪", label: "Hold the door", note: "Small, fast, undefeated." },
  { emoji: "🛍️", label: "Help with bags", note: "Two hands beat one." },
  { emoji: "☕", label: "Cover a coffee", note: "Tiny cup, solid plot twist." },
];

function esc(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function icsDate(date) {
  return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export default function ContinuationCard({ circleId, linkId, passBy }) {
  const [plan, setPlan] = useState(null);
  const [reminded, setReminded] = useState(false);

  useEffect(() => {
    try { setPlan(JSON.parse(localStorage.getItem(PLAN_KEY) || "null")); } catch {}
  }, []);

  function choose(idea) {
    const next = { ...idea, circleId, linkId, pickedAt: new Date().toISOString() };
    setPlan(next);
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(next)); } catch {}
    track("continuation_plan_selected", { linkId, circleId, metadata: { deed: idea.label } });
  }

  function addReminder() {
    const deadline = new Date(passBy);
    const start = new Date(Math.max(Date.now() + 5 * 60000, deadline.getTime() - 2 * 3600000));
    const end = new Date(start.getTime() + 30 * 60000);
    const chosen = plan?.label || "do a good deed and pass it on";
    const body = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Circle of Deeds//Reminder//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT", `UID:circle-${esc(circleId)}-${Date.now()}@circleofdeeds.app`,
      `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`,
      `SUMMARY:${esc("Pass on your Circle of Deeds")}`,
      `DESCRIPTION:${esc(`Your plan: ${chosen}. Keep Circle #${circleId} moving at https://circleofdeeds.app/start`)}`,
      "URL:https://circleofdeeds.app/start", "END:VEVENT", "END:VCALENDAR", "",
    ].join("\r\n");
    const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "circle-of-deeds-reminder.ics"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setReminded(true);
    track("reminder_downloaded", { linkId, circleId, metadata: { has_plan: Boolean(plan) } });
  }

  return (
    <section className="continuation-card" aria-labelledby="next-deed-title">
      <div className="eyebrow">Your turn, good human</div>
      <h3 id="next-deed-title">Pick an easy win</h3>
      <p className="muted small">A tiny plan is much harder to forget than a noble intention.</p>
      <div className="plan-grid">
        {IDEAS.map((idea) => (
          <button key={idea.label} className={`plan-option${plan?.label === idea.label ? " chosen" : ""}`} onClick={() => choose(idea)}>
            <span className="plan-emoji" aria-hidden="true">{idea.emoji}</span>
            <span><b>{idea.label}</b><small>{idea.note}</small></span>
          </button>
        ))}
      </div>
      {plan && <div className="notice ok">Excellent. <b>{plan.label}</b> is the plan. No cape required.</div>}
      <button className="btn ghost block" onClick={addReminder}>
        {reminded ? "Reminder downloaded ✓" : "Add a calendar nudge"}
      </button>
      <p className="microcopy">The reminder stays on your device. We still do not need your email.</p>
    </section>
  );
}
