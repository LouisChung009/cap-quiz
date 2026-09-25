import { neon } from "@neondatabase/serverless";

let schemaPromise;

export function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(process.env.DATABASE_URL);
}

export async function ensureSchema(sql = database()) {
  if (!schemaPromise) schemaPromise = initialize(sql).catch(error => { schemaPromise = null; throw error; });
  await schemaPromise;
  return sql;
}

async function initialize(sql) {
  await sql`CREATE TABLE IF NOT EXISTS user_profiles (user_id TEXT PRIMARY KEY, display_name TEXT NOT NULL DEFAULT '學習者', public_code TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS learning_states (user_id TEXT PRIMARY KEY, state JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS question_attempts (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id TEXT NOT NULL, question_id TEXT NOT NULL, subject TEXT NOT NULL CHECK (subject IN ('國文','英文','數學','自然','社會')), unit_name TEXT NOT NULL DEFAULT '', knowledge_point TEXT NOT NULL DEFAULT '', is_correct BOOLEAN NOT NULL, answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE INDEX IF NOT EXISTS idx_attempts_user_time ON question_attempts (user_id, answered_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_attempts_day ON question_attempts (answered_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_attempts_subject ON question_attempts (subject, answered_at DESC)`;
}
