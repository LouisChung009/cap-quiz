import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "https://louischung009.github.io", "Access-Control-Allow-Headers": "authorization, apikey, content-type" };

serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const authorization = request.headers.get("Authorization");
  if (!authorization) return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  const admin = createClient(url, serviceKey);
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "platform_admin") return Response.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders });

  const today = new Date().toISOString().slice(0, 10);
  const [{ count: studentCount }, { data: todayStats }, { data: students }] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    admin.from("daily_learning_stats").select("answered_count,correct_count,user_id").eq("study_date", today),
    admin.from("daily_learning_stats").select("user_id,answered_count,correct_count,last_activity_at,weakest_points,profiles!inner(public_code,display_name)").eq("study_date", today).order("last_activity_at", { ascending: false }).limit(100)
  ]);
  const active = todayStats?.filter(item => item.answered_count > 0) ?? [];
  const answered = active.reduce((sum, item) => sum + item.answered_count, 0);
  const correct = active.reduce((sum, item) => sum + item.correct_count, 0);
  await admin.from("admin_audit_logs").insert({ admin_user_id: user.id, action: "read_dashboard" });
  return Response.json({ summary: { studentCount: studentCount ?? 0, activeCount: active.length, answeredCount: answered, accuracy: answered ? Math.round(correct / answered * 1000) / 10 : 0 }, students: students ?? [] }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
