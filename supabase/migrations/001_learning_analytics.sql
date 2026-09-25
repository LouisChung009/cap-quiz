create extension if not exists pgcrypto;

create type public.account_role as enum ('student', 'platform_admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  public_code text not null unique,
  display_name text not null check (char_length(display_name) between 1 and 30),
  role public.account_role not null default 'student',
  guardian_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  mode text not null check (mode in ('practice','challenge','wrong_review')),
  question_count integer not null default 0 check (question_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  client_session_id uuid not null unique,
  created_at timestamptz not null default now()
);

create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid references public.learning_sessions(id) on delete set null,
  question_id text not null,
  subject text not null check (subject in ('國文','英文','數學','自然','社會')),
  unit text not null,
  knowledge_point text not null,
  difficulty text not null check (difficulty in ('基礎','中等','進階')),
  selected_answer smallint not null check (selected_answer between 0 and 3),
  correct_answer smallint not null check (correct_answer between 0 and 3),
  is_correct boolean not null,
  duration_ms integer check (duration_ms between 0 and 3600000),
  is_review boolean not null default false,
  answered_at timestamptz not null,
  received_at timestamptz not null default now()
);

create table public.daily_learning_stats (
  user_id uuid not null references public.profiles(id) on delete cascade,
  study_date date not null,
  answered_count integer not null default 0,
  correct_count integer not null default 0,
  unique_question_count integer not null default 0,
  active_seconds integer not null default 0,
  completed_sessions integer not null default 0,
  review_count integer not null default 0,
  subject_stats jsonb not null default '{}'::jsonb,
  weakest_points jsonb not null default '[]'::jsonb,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, study_date)
);

create table public.admin_audit_logs (
  id bigint generated always as identity primary key,
  admin_user_id uuid not null references public.profiles(id),
  action text not null,
  target_user_id uuid references public.profiles(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index question_attempts_user_time_idx on public.question_attempts(user_id, answered_at desc);
create index question_attempts_subject_idx on public.question_attempts(subject, answered_at desc);
create index daily_learning_stats_date_idx on public.daily_learning_stats(study_date desc);

alter table public.profiles enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.question_attempts enable row level security;
alter table public.daily_learning_stats enable row level security;
alter table public.admin_audit_logs enable row level security;

revoke all on public.admin_audit_logs from anon, authenticated;
revoke all on public.daily_learning_stats from anon;
revoke all on public.question_attempts from anon;
revoke all on public.learning_sessions from anon;

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.learning_sessions to authenticated;
grant select, insert on public.question_attempts to authenticated;
grant select on public.daily_learning_stats to authenticated;

create policy "students read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "students update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = 'student');
create policy "students read own sessions" on public.learning_sessions for select to authenticated using (user_id = auth.uid());
create policy "students insert own sessions" on public.learning_sessions for insert to authenticated with check (user_id = auth.uid());
create policy "students update own sessions" on public.learning_sessions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "students read own attempts" on public.question_attempts for select to authenticated using (user_id = auth.uid());
create policy "students insert own attempts" on public.question_attempts for insert to authenticated with check (user_id = auth.uid());
create policy "students read own daily stats" on public.daily_learning_stats for select to authenticated using (user_id = auth.uid());

comment on table public.question_attempts is 'Append-only answer events. Platform-wide reads must go through an authenticated server-side admin API.';
comment on table public.daily_learning_stats is 'Server-maintained daily aggregates; clients cannot insert or update.';