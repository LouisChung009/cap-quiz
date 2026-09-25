import { requireAuth, handleApiError } from "./_lib/auth.js";
import { database, ensureSchema } from "./_lib/db.js";
const MAX_STATE_BYTES = 700000;
export default async function handler(request, response) {
  try {
    const claims = await requireAuth(request); const sql = await ensureSchema(database());
    if (request.method === "GET") { const rows = await sql`SELECT state, updated_at FROM learning_states WHERE user_id = ${claims.sub}`; return response.status(200).json(rows[0] || { state: null, updated_at: null }); }
    if (request.method === "PUT") { const state = request.body?.state; if (!state || typeof state !== "object" || Buffer.byteLength(JSON.stringify(state)) > MAX_STATE_BYTES) return response.status(400).json({ message: "進度資料格式不正確。" }); await sql`INSERT INTO learning_states (user_id, state, updated_at) VALUES (${claims.sub}, ${JSON.stringify(state)}::jsonb, NOW()) ON CONFLICT (user_id) DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()`; return response.status(204).end(); }
    return response.status(405).json({ message: "Method not allowed" });
  } catch (error) { return handleApiError(response, error); }
}
