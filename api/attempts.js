import { requireAuth, handleApiError } from "./_lib/auth.js";
import { database, ensureSchema } from "./_lib/db.js";
const subjects = new Set(["國文", "英文", "數學", "自然", "社會"]);
export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ message: "Method not allowed" });
  try {
    const claims = await requireAuth(request); const { questionId, subject, correct, unit, knowledgePoint, answeredAt } = request.body || {};
    if (!/^[a-z]+-\d{4}$/.test(questionId || "") || !subjects.has(subject) || typeof correct !== "boolean") return response.status(400).json({ message: "作答資料格式不正確。" });
    const sql = await ensureSchema(database()); await sql`INSERT INTO question_attempts (user_id, question_id, subject, unit_name, knowledge_point, is_correct, answered_at) VALUES (${claims.sub}, ${questionId}, ${subject}, ${String(unit || "").slice(0, 80)}, ${String(knowledgePoint || "").slice(0, 80)}, ${correct}, ${new Date(answeredAt || Date.now()).toISOString()})`;
    return response.status(201).json({ saved: true });
  } catch (error) { return handleApiError(response, error); }
}
