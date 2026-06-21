// admin-users — privileged user management for SOC Checker
// Runs on Supabase Edge Functions (Deno). Holds the service-role key server-side;
// it is NEVER exposed to the browser. Only an authenticated GM/Admin may call it,
// except the one-time `seed` bootstrap allowed while there are zero users.
//
// Deploy:  supabase functions deploy admin-users
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "user";

const validPin = (p: unknown): p is string => typeof p === "string" && /^\d{6}$/.test(p);
const ROLES = ["teamleader", "trainer", "manager", "admin"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  let payload: any;
  try { payload = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const action = payload?.action;

  // ── Bootstrap: allow creating the very first admin only when no users exist ──
  const { count } = await admin.from("profiles").select("*", { count: "exact", head: true });
  const isBootstrap = (count ?? 0) === 0;

  if (action === "seed") {
    if (!isBootstrap) return json({ error: "Already initialised" }, 403);
    const members = Array.isArray(payload.members) ? payload.members : [];
    const results = [];
    for (const m of members) {
      if (!validPin(m.pin) || !ROLES.includes(m.role) || !m.display_name) {
        results.push({ name: m.display_name, error: "Invalid member" }); continue;
      }
      const email = `${slug(m.display_name)}-${crypto.randomUUID().slice(0, 6)}@socchecker.local`;
      const { error } = await admin.auth.admin.createUser({
        email, password: m.pin, email_confirm: true,
        user_metadata: { display_name: m.display_name, role: m.role, outlet: m.outlet || "Brock" },
      });
      results.push({ name: m.display_name, error: error?.message ?? null });
    }
    return json({ ok: true, results });
  }

  // ── All other actions require an authenticated admin caller ──
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return json({ error: "Not authenticated" }, 401);

  const caller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } }, auth: { persistSession: false },
  });
  const { data: ures } = await caller.auth.getUser();
  if (!ures?.user) return json({ error: "Not authenticated" }, 401);

  const { data: prof } = await admin.from("profiles").select("role").eq("id", ures.user.id).single();
  if (prof?.role !== "admin") return json({ error: "Forbidden — admin only" }, 403);

  if (action === "create") {
    const { display_name, role, pin, outlet } = payload;
    if (!display_name || !ROLES.includes(role)) return json({ error: "Bad name or role" }, 400);
    if (!validPin(pin)) return json({ error: "PIN must be exactly 6 digits" }, 400);
    const email = `${slug(display_name)}-${crypto.randomUUID().slice(0, 6)}@socchecker.local`;
    const { error } = await admin.auth.admin.createUser({
      email, password: pin, email_confirm: true,
      user_metadata: { display_name, role, outlet: outlet || "Brock" },
    });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  if (action === "delete") {
    if (!payload.id) return json({ error: "Missing id" }, 400);
    if (payload.id === ures.user.id) return json({ error: "You cannot delete yourself" }, 400);
    const { error } = await admin.auth.admin.deleteUser(payload.id);
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  if (action === "setpin") {
    if (!payload.id || !validPin(payload.pin)) return json({ error: "Need id and 6-digit PIN" }, 400);
    const { error } = await admin.auth.admin.updateUserById(payload.id, { password: payload.pin });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return json({ error: "Unknown action" }, 400);
});
