# Production smoke verification — 2026-10-07

Deployment commit: `0d3c445` (`Validate and precache all question figures`)

## Verified

- Vercel learner homepage returns HTTP 200 and renders an authenticated learner view with the challenge card, five-subject selector, difficulty/unit/source filters, and a complete question with four answer choices.
- No answer was submitted and no learner progress was changed during this inspection.
- The deployed service worker returns HTTP 200 and includes the newly added official-question image assets in its cache list.
- `/api/health` returns 200; unauthenticated `/api/progress` and `/api/admin/dashboard` return 401; unauthenticated `GET /api/attempts` returns 405 because the route only accepts POST.
- GitHub Pages deployment workflow for `0d3c445` completed successfully. The production Vercel alias served the matching updated service worker.
- `npm test` passed, including the 5,000 authored-question format/ID checks, 100,000 random-draw checks with no within-round repeats, official-key consistency checks, and 406 offline figure references.

## Not established by this smoke test

- Button-by-button learner journey, answer submission/persistence, garden/team/settings flows, mobile layout, and signed-in admin dashboard interactions were not exercised.
- All 5,000 authored questions still lack qualified, signed teacher-review fields. Automated and source-based checks do not replace teacher certification.
- HTTP availability and successful deployment do not alone establish complete production acceptance.
