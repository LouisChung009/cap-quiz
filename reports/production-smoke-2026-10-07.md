# Production smoke verification — 2026-10-07

Latest acceptance commit: `8cab7ef` (`Add mobile challenge layout acceptance test`)

## Verified

- Vercel learner homepage and `/api/health` return HTTP 200; production serves app cache version `7.5.186` and the learning-sync module.
- A signed-in learner view rendered the current profile, challenge card, five-subject selector, difficulty/unit/source filters, a complete four-choice question, and the status “學習進度與答題紀錄已同步”. The startup progress PUT completed successfully; no answer was submitted.
- Production service worker returns HTTP 200. Unauthenticated `/api/progress`, `/api/admin/dashboard`, and `POST /api/attempts` return 401; a protocol-relative external auth return path returns 400.
- GitHub Actions for commits `d92a7c8` and `8cab7ef` completed successfully, including GitHub Pages deployment.
- `npm test` passed for 5,000 authored items plus 1,098 official items and 10 similar items; 100,000 random draws had no within-round repeats, official-key and figure validations passed.
- Playwright E2E passed all three checks, including the 390px mobile layout: no page-level horizontal overflow, challenge button visible, no overlap with prompt text, and 44px minimum touch target.
- The ten-question challenge E2E also asserts that each required image is actually loaded with nonzero natural dimensions and that context-dependent questions expose their reading-material caption and embedded or linked material.
- `npm run build`, `npm audit` (0 vulnerabilities), and `git diff --check` passed.

## Not established by this smoke test

- A real signed-in answer was intentionally not submitted, to avoid adding a fabricated attempt to the learner’s permanent record; the authenticated attempt INSERT path is therefore not production-smoke-tested. Its unauthenticated access control is verified.
- Garden/team/settings and admin dashboard interactions were exercised by local Playwright, not by clicks in the production session; a signed-in administrator workflow was not verified.
- Existing dated AI/source-review reports cover all 1,000 authored questions in each subject, but all 5,000 authored questions still lack qualified, signed teacher-review fields. Automated and AI/source-based checks do not replace teacher certification.
- The challenge's sampled questions are browser-verified with rendered required figures; this does not amount to opening every item in the browser or checking every asset visually against the official original.
- The initial production progress sync confirms the signed-in `learning_states` write path; it does not prove every user-flow or answer-attempt path works end-to-end.
