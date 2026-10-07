import { requireAuth, handleApiError } from "./_lib/auth.js";
import { database, ensureSchema, upsertUserProfile } from "./_lib/db.js";
import { isValidQuestionId } from "./_lib/question-id.js";
const subjects = new Set(["國文", "英文", "數學", "自然", "社會"]);
export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ message: "Method not allowed" });
  try {
    const claims = await requireAuth(request); const { questionId, subject, correct, unit, knowledgePoint, answeredAt, clientAttemptId } = request.body || {};
    if (!isValidQuestionId(questionId) || !subjects.has(subject) || typeof correct !== "boolean") return response.status(400).json({ message: "作答資料格式不正確。" });
    if (clientAttemptId !== undefined && (typeof clientAttemptId !== "string" || !/^[A-Za-z0-9_-]{16,80}$/.test(clientAttemptId))) return response.status(400).json({ message: "作答識別碼格式不正確。" });
    const sql = await ensureSchema(database()); await upsertUserProfile(sql, claims);
    if (clientAttemptId) await sql`INSERT INTO question_attempts (user_id, question_id, subject, unit_name, knowledge_point, is_correct, answered_at, client_attempt_id) VALUES (${claims.sub}, ${questionId}, ${subject}, ${String(unit || "").slice(0, 80)}, ${String(knowledgePoint || "").slice(0, 80)}, ${correct}, ${new Date(answeredAt || Date.now()).toISOString()}, ${clientAttemptId}) ON CONFLICT (user_id, client_attempt_id) WHERE client_attempt_id IS NOT NULL DO NOTHING`;
    else await sql`INSERT INTO question_attempts (user_id, question_id, subject, unit_name, knowledge_point, is_correct, answered_at) VALUES (${claims.sub}, ${questionId}, ${subject}, ${String(unit || "").slice(0, 80)}, ${String(knowledgePoint || "").slice(0, 80)}, ${correct}, ${new Date(answeredAt || Date.now()).toISOString()})`;
    return response.status(201).json({ saved: true });
  } catch (error) { return handleApiError(response, error); }
}
