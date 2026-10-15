import { supabase } from "./supabase";
import { getGuestId } from "./guest";

// Product events stay deliberately small: no names, emails, notes, or precise location.
// Until migration 003 is applied, writes fail quietly so the deed flow remains usable.
export async function track(eventName, details = {}) {
  try {
    const guestId = await getGuestId();
    await supabase().from("app_events").insert({
      event_name: eventName,
      guest_id: guestId ? String(guestId) : null,
      link_id: details.linkId ? String(details.linkId) : null,
      circle_id: details.circleId ? String(details.circleId) : null,
      metadata: details.metadata || {},
    });
  } catch {}
}
