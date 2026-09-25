import { createClerkClient } from "@clerk/backend";
import { requireAdmin, handleApiError } from "../_lib/auth.js";
import { database, ensureSchema } from "../_lib/db.js";

const zone = "Asia/Taipei";

async function syncClerkUsers(sql) {
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  let offset = 0;
  while (offset < 5000) {
    const page = await clerk.users.getUserList({ limit: 500, offset });
    if (!page.data.length) break;
    for (const user of page.data) {
      const name = String(user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "學習者").slice(0, 30);
      const publicCode = `S-${user.id.slice(-8).toUpperCase()}`;
      const lastSeen = new Date(user.lastActiveAt || user.updatedAt || Date.now()).toISOString();
      await sql`INSERT INTO user_profiles (user_id, display_name, public_code, last_seen_at)
        VALUES (${user.id}, ${name}, ${publicCode}, ${lastSeen})
        ON CONFLICT (user_id) DO UPDATE SET display_name=EXCLUDED.display_name, last_seen_at=EXCLUDED.last_seen_at`;
    }
    offset += page.data.length;
    if (page.data.length < 500) break;
  }
}

export default async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ message: "Method not allowed" });
  try {
    await requireAdmin(request);
    const sql = await ensureSchema(database());
    await syncClerkUsers(sql);
    const [summary] = await sql`WITH today AS (SELECT * FROM question_attempts WHERE (answered_at AT TIME ZONE ${zone})::date=(NOW() AT TIME ZONE ${zone})::date)
      SELECT (SELECT COUNT(*) FROM user_profiles)::int student_count, COUNT(DISTINCT user_id)::int active_count,
      COUNT(*)::int answered_count, COALESCE(ROUND(100.0*AVG(CASE WHEN is_correct THEN 1 ELSE 0 END),1),0) accuracy FROM today`;
    const students = await sql`WITH activity AS (
      SELECT user_id, COUNT(*)::int total_count,
      COUNT(*) FILTER (WHERE (answered_at AT TIME ZONE ${zone})::date=(NOW() AT TIME ZONE ${zone})::date)::int answered_count,
      COUNT(*) FILTER (WHERE is_correct AND answered_at>=NOW()-INTERVAL '30 days')::int correct_count,
      COUNT(*) FILTER (WHERE answered_at>=NOW()-INTERVAL '30 days')::int accuracy_base, MAX(answered_at) last_activity_at
      FROM question_attempts GROUP BY user_id
    ), streaks AS (
      SELECT user_id, COUNT(*)::int streak FROM (
        SELECT user_id, study_day, ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY study_day DESC) rn,
        (NOW() AT TIME ZONE ${zone})::date-study_day gap
        FROM (SELECT DISTINCT user_id,(answered_at AT TIME ZONE ${zone})::date study_day FROM question_attempts) d
      ) r WHERE gap=rn-1 GROUP BY user_id
    ) SELECT p.user_id,p.display_name,p.public_code,COALESCE(a.total_count,0)::int total_count,
      COALESCE(a.answered_count,0)::int answered_count,COALESCE(a.correct_count,0)::int correct_count,
      COALESCE(a.accuracy_base,0)::int accuracy_base,a.last_activity_at,COALESCE(s.streak,0)::int streak
      FROM user_profiles p LEFT JOIN activity a ON a.user_id=p.user_id LEFT JOIN streaks s ON s.user_id=p.user_id
      ORDER BY a.last_activity_at DESC NULLS LAST,p.created_at DESC LIMIT 500`;
    const weak = await sql`SELECT user_id,knowledge_point,COUNT(*)::int wrong_count FROM question_attempts
      WHERE NOT is_correct AND answered_at>=NOW()-INTERVAL '30 days' AND knowledge_point<>''
      GROUP BY user_id,knowledge_point ORDER BY user_id,wrong_count DESC`;
    const subjects = await sql`SELECT subject,COUNT(*)::int attempts,ROUND(100.0*AVG(CASE WHEN is_correct THEN 1 ELSE 0 END),1) accuracy
      FROM question_attempts WHERE answered_at>=NOW()-INTERVAL '30 days' GROUP BY subject`;
    const trend = await sql`WITH dates AS (SELECT GENERATE_SERIES((NOW() AT TIME ZONE ${zone})::date-6,(NOW() AT TIME ZONE ${zone})::date,'1 day')::date trend_day)
      SELECT dates.trend_day,COUNT(DISTINCT a.user_id)::int active_users,COUNT(a.id)::int questions FROM dates
      LEFT JOIN question_attempts a ON (a.answered_at AT TIME ZONE ${zone})::date=dates.trend_day GROUP BY dates.trend_day ORDER BY dates.trend_day`;
    const [alerts] = await sql`WITH stats AS (SELECT p.user_id,MAX(a.answered_at) last_activity,
      COUNT(a.id) FILTER(WHERE (a.answered_at AT TIME ZONE ${zone})::date=(NOW() AT TIME ZONE ${zone})::date) today_count,
      AVG(CASE WHEN a.is_correct THEN 1.0 ELSE 0.0 END) FILTER(WHERE (a.answered_at AT TIME ZONE ${zone})::date=(NOW() AT TIME ZONE ${zone})::date) today_accuracy,
      COUNT(a.id) FILTER(WHERE NOT a.is_correct AND a.answered_at>=NOW()-INTERVAL '30 days') wrong_30d
      FROM user_profiles p LEFT JOIN question_attempts a ON a.user_id=p.user_id GROUP BY p.user_id)
      SELECT COUNT(*) FILTER(WHERE last_activity IS NULL OR last_activity<NOW()-INTERVAL '3 days')::int inactive_3d,
      COUNT(*) FILTER(WHERE today_count>=5 AND today_accuracy<.5)::int low_accuracy,
      COUNT(*) FILTER(WHERE wrong_30d>=10)::int many_wrong FROM stats`;
    const weakByUser = weak.reduce((map,item)=>{(map[item.user_id] ||= []).push({name:item.knowledge_point,count:item.wrong_count});return map;},{});
    return response.status(200).json({summary,students:students.map(student=>({...student,weakest_points:(weakByUser[student.user_id]||[]).slice(0,5)})),subjects,trend,alerts,generatedAt:new Date().toISOString()});
  } catch (error) { return handleApiError(response,error); }
}
