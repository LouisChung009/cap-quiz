# English audit recheck: ENG-0601–0700

## Finding

The existing `reports/英文-teacher-audit.json` entries for ENG-0601–0700 say that each item refers to a missing "report N" and asks for the meaning of *rapid*. That finding does not match the current records in `data/english.json`.

The current items cover varied contextualized vocabulary and reading situations. ENG-0601–0620 were manually compared at item level: their stems do not make the cited report/rapid claim, and their current explanations give item-specific evidence. The previous item-level follow-up `reports/audit-authored-english-0601-0620-2026-10-04.md` records a detailed review of all 20 items and repairs to three of them. A literal scan of ENG-0621–0700 also found no "report N" or "rapid" in any of those current stems; this scan only establishes that the listed premise is stale, not that those 80 questions are pedagogically or factually correct.

## Disposition

- ENG-0601–0700: withdraw the stale "report N / rapid" issue premise against the current bank revision. ENG-0601–0620 have item-level AI recheck; ENG-0621–0700 only have a premise-mismatch scan and remain unverified for correctness, completeness, and quality.
- This is not a teacher verdict and does not satisfy the external subject-teacher review gate; all 100 rows remain pending in the teacher review packet.
- The broader English audit register and all other subject audit entries have not been reconciled by this note.

## Evidence and limits

Compared current English bank stems to the 100 matching findings in `reports/英文-teacher-audit.json`; none contains the cited "report N" or "rapid" premise. For ENG-0601–0620, also compared options, answer index, explanation, solution steps, and teacher tips and consulted the previous 20-item review report. `reports/teacher-review-packets/english-teacher-review.csv` still has blank teacher-verdict and reviewer fields for all 100 rows.
