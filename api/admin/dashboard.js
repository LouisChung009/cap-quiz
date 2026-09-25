import { requireAdmin, handleApiError } from "../_lib/auth.js";
import { database, ensureSchema } from "../_lib/db.js";

export default async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ message: "Method not allowed" });
  try {
    await requireAdmin(request); const sql = await ensureSchema(database());
    const [summary] = await sql`SELECT COUNT(DISTINCT user_id)::int student_count, COUNT(DISTINCT user_id) FILTER (WHERE answered_at >= CURRENT_DATE)::int active_count, COUNT(*) FILTER (WHERE answered_at >= CURRENT_DATE)::int answered_count, COALESCE(ROUND(100.0 * AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) FILTER (WHERE answered_at >= CURRENT_DATE),1),0) accuracy FROM question_attempts`;
    const students = await sql`SELECT attempts.user_id, profiles.display_name, profiles.public_code, COUNT(*)::int total_count, COUNT(*) FILTER (WHERE attempts.answered_at >= CURRENT_DATE)::int answered_count, COUNT(*) FILTER (WHERE attempts.is_correct AND attempts.answered_at >= CURRENT_DATE)::int correct_count, MAX(attempts.answered_at) last_activity_at, ARRAY_AGG(DISTINCT attempts.knowledge_point) FILTER (WHERE NOT attempts.is_correct) weakest_points FROM question_attempts attempts LEFT JOIN user_profiles profiles ON profiles.user_id = attempts.user_id GROUP BY attempts.user_id, profiles.display_name, profiles.public_code ORDER BY last_activity_at DESC LIMIT 500`;
    const subjects = await sql`SELECT subject, COUNT(*)::int attempts, ROUND(100.0 * AVG(CASE WHEN is_correct THEN 1 ELSE 0 END),1) accuracy FROM question_attempts WHERE answered_at >= CURRENT_DATE - INTERVAL '30 days' GROUP BY subject`;
    const trend = await sql`SELECT answered_at::date AS trend_day, COUNT(DISTINCT user_id)::int active_users, COUNT(*)::int questions FROM question_attempts WHERE answered_at >= CURRENT_DATE - INTERVAL '6 days' GROUP BY trend_day ORDER BY trend_day`;
    return response.status(200).json({ summary, students, subjects, trend });
  } catch (error) { return handleApiError(response, error); }
}
