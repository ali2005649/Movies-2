import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const urlOk =
  typeof supabaseUrl === "string" && /^https:\/\/.+\.supabase\.co\/?$/.test(supabaseUrl);
const keyOk = typeof supabaseAnonKey === "string" && supabaseAnonKey.length > 20;

console.info("[supabase] client init", {
  hasUrl: Boolean(supabaseUrl),
  urlOk,
  urlHost: (() => {
    try {
      return new URL(supabaseUrl).host;
    } catch {
      return "(invalid VITE_SUPABASE_URL)";
    }
  })(),
  hasAnonKey: Boolean(supabaseAnonKey),
  keyOk,
  keyPrefix: supabaseAnonKey ? `${String(supabaseAnonKey).slice(0, 18)}…` : "(missing)",
  keyLength: supabaseAnonKey ? String(supabaseAnonKey).length : 0,
});

if (!urlOk || !keyOk) {
  console.error("[supabase] Missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Restart the Vite dev server after editing .env.local.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
