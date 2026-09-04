import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

let browserClient;
export function supabase() {
  if (typeof window === "undefined") return createClient(url, key, { auth: { persistSession: false } });
  if (!browserClient) browserClient = createClient(url, key);
  return browserClient;
}
