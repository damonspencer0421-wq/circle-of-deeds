"use client";
import { useEffect, useState } from "react";

export default function Countdown({ until, label = "to pass it on" }) {
  const [txt, setTxt] = useState("--:--:--");
  useEffect(() => {
    const end = new Date(until).getTime();
    const tick = () => {
      const r = Math.max(0, end - Date.now());
      const h = Math.floor(r / 3600000), m = Math.floor((r % 3600000) / 60000), s = Math.floor((r % 60000) / 1000);
      setTxt([h, m, s].map((n) => String(n).padStart(2, "0")).join(":"));
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [until]);
  return <div className="clock" role="timer" aria-live="off">{txt}<small>{label}</small></div>;
}
