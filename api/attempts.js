import { requireAuth, handleApiError } from "./_lib/auth.js";
import { database, ensureSchema, upsertUserProfile } from "./_lib/db.js";
import { isValidQuestionId } from "./_lib/question-id.js";
import { getQuestionMap } from "./_lib/question-bank.js";
import { gradeAttempt } from "./_lib/grade-attempt.js";
const subjects = new Set(["國文", "英文", "數學", "自然", "社會"]);
export function createAttemptsHandler(dependencies = {}) {
  const authenticate = dependencies.requireAuth || requireAuth;
  const apiErrorHandler = dependencies.handleApiError || handleApiError;
  const getDatabase = dependencies.database || database;
  const prepareSchema = dependencies.ensureSchema || ensureSchema;
  const saveUserProfile = dependencies.upsertUserProfile || upsertUserProfile;
  const loadQuestionMap = dependencies.getQuestionMap || getQuestionMap;
  const getNow = dependencies.now || Date.now;
  return async function handler(request, response) {
    if (request.method !== "POST") return response.status(405).json({ message: "Method not allowed" });
    try {
      const claims = await authenticate(request); const { questionId, subject, selectedAnswer, responseValues, answeredAt, clientAttemptId } = request.body || {};
      if (!isValidQuestionId(questionId) || !subjects.has(subject)) return response.status(400).json({ message: "作答資料格式不正確。" });
      if (clientAttemptId !== undefined && (typeof clientAttemptId !== "string" || !/^[A-Za-z0-9_-]{16,80}$/.test(clientAttemptId))) return response.status(400).json({ message: "作答識別碼格式不正確。" });
      const question = (await loadQuestionMap()).get(questionId);
      const correct = gradeAttempt(question, { subject, selectedAnswer, responseValues });
      if (correct === null) return response.status(400).json({ message: "題目或作答內容不正確。" });
      const now = getNow();
      const submittedAt = typeof answeredAt === "number" && Number.isSafeInteger(answeredAt) ? new Date(answeredAt) : null;
      const clientAnsweredAt = submittedAt && Number.isFinite(submittedAt.getTime()) && submittedAt.getTime() <= now + 5 * 60 * 1000 ? submittedAt.toISOString() : null;
      const sql = await prepareSchema(getDatabase()); await saveUserProfile(sql, claims);
      const attemptSubject = question.subject;
      const unit = String(question.unit || "").slice(0, 80);
      const knowledgePoint = String(question.knowledgePoint || "").slice(0, 80);
      if (clientAttemptId) await sql`INSERT INTO question_attempts (user_id, question_id, subject, unit_name, knowledge_point, is_correct, answered_at, client_answered_at, client_attempt_id) VALUES (${claims.sub}, ${questionId}, ${attemptSubject}, ${unit}, ${knowledgePoint}, ${correct}, NOW(), ${clientAnsweredAt}, ${clientAttemptId}) ON CONFLICT (user_id, client_attempt_id) WHERE client_attempt_id IS NOT NULL DO NOTHING`;
      else await sql`INSERT INTO question_attempts (user_id, question_id, subject, unit_name, knowledge_point, is_correct, answered_at, client_answered_at) VALUES (${claims.sub}, ${questionId}, ${attemptSubject}, ${unit}, ${knowledgePoint}, ${correct}, NOW(), ${clientAnsweredAt})`;
      return response.status(201).json({ saved: true, correct });
    } catch (error) { return apiErrorHandler(response, error); }
  };
}

export default createAttemptsHandler();
