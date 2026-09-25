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
  const { events } = await request.json();
  if (!Array.isArray(events) || events.length === 0 || events.length > 100) return Response.json({ error: "Invalid event batch" }, { status: 400, headers: corsHeaders });
  const allowedSubjects = new Set(["國文", "英文", "數學", "自然", "社會"]);
  const rows = events.map(event => {
    if (!event.eventId || !allowedSubjects.has(event.subject) || !Number.isInteger(event.selectedAnswer) || !Number.isInteger(event.correctAnswer)) throw new Error("Invalid event");
    return { event_id: event.eventId, user_id: user.id, question_id: event.questionId, subject: event.subject, unit: event.unit, knowledge_point: event.knowledgePoint, difficulty: event.difficulty, selected_answer: event.selectedAnswer, correct_answer: event.correctAnswer, is_correct: event.selectedAnswer === event.correctAnswer, duration_ms: Math.min(Math.max(event.durationMs || 0, 0), 3600000), is_review: Boolean(event.isReview), answered_at: event.answeredAt };
  });
  const admin = createClient(url, serviceKey);
  const { error } = await admin.from("question_attempts").upsert(rows, { onConflict: "event_id", ignoreDuplicates: true });
  if (error) return Response.json({ error: "Unable to record events" }, { status: 500, headers: corsHeaders });
  return Response.json({ accepted: rows.length }, { headers: corsHeaders });
});
