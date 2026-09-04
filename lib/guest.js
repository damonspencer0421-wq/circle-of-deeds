import { supabase } from "./supabase";

const KEY = "cod_guest_id";

// An anonymous guest is a random id in this browser. No email, no name.
export async function getGuestId() {
  if (typeof window === "undefined") return null;
  try {
    const cached = window.localStorage.getItem(KEY);
    if (cached) return cached;
  } catch {}
  const { data, error } = await supabase().from("guests").insert({}).select("id").single();
  if (error || !data) return null;
  try { window.localStorage.setItem(KEY, data.id); } catch {}
  return data.id;
}

export function rememberLink(linkId, circleId, passBy) {
  try {
    window.localStorage.setItem("cod_open_link", JSON.stringify({ linkId, circleId, passBy }));
  } catch {}
}
export function openLink() {
  try {
    const raw = window.localStorage.getItem("cod_open_link");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
