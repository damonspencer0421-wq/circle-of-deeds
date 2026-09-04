// Coarse location only. We round to ~0.15 degrees (about 10 miles) and never store raw coordinates.
export function toCell(lat, lng) {
  const r = (n) => (Math.round(n / 0.15) * 0.15).toFixed(2);
  return `${r(lat)},${r(lng)}`;
}
export function cellToLatLng(cell) {
  if (!cell) return null;
  const [a, b] = cell.split(",").map(Number);
  return Number.isFinite(a) && Number.isFinite(b) ? { lat: a, lng: b } : null;
}
export function milesBetween(c1, c2) {
  const a = cellToLatLng(c1), b = cellToLatLng(c2);
  if (!a || !b) return 0;
  const R = 3958.8, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export function chainMiles(links) {
  // links sorted by id; distance between consecutive accepted links with cells
  let total = 0, prev = null;
  for (const l of links) {
    if (!l.geo_cell) continue;
    if (prev) total += milesBetween(prev, l.geo_cell);
    prev = l.geo_cell;
  }
  return Math.round(total);
}

// Ask the browser for a coarse position, then look up the city name.
export async function coarseLocate() {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  const pos = await new Promise((res) =>
    navigator.geolocation.getCurrentPosition((p) => res(p), () => res(null), { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 })
  );
  if (!pos) return null;
  const cell = toCell(pos.coords.latitude, pos.coords.longitude);
  const { lat, lng } = cellToLatLng(cell);
  let city = null, region = null;
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${lat}&lon=${lng}`, { headers: { Accept: "application/json" } });
    const j = await r.json();
    const a = j.address || {};
    city = a.city || a.town || a.village || a.county || null;
    region = a.state || null;
  } catch {}
  return { cell, city, region };
}
