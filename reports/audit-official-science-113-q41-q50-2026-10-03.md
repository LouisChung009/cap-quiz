# Official 113 Science Q41–50 Audit

- Reviewed OFF-0865–0874 against official exam pages 11–14, the chart for Q49, and the official answer table.
- Official answer sequence Q41–50: D, C, D, A, B, D, A, C, C, C; existing answer indices match.
- Q41: checked the four-step enzyme schedule; the explicit irreversible loss above 75°C makes product B stop increasing after the 85°C stage, so 10:50 and 11:00 match.
- Q42–43: confirmed the complete shared text states illegal export for market demand, current EN status, and the IUCN threatened categories CR/EN/VU; no flowchart screenshot is required to answer.
- Q44–45: checked 2020 generation shares and the government's targets, then compared per-kWh pollutant values. A is the only plan that retires nuclear, raises renewables, and lowers coal; all three listed pollutants are lower for gas than coal.
- Q46–48: verified 52,729 億度 = 5.2729×10¹² 度, 2017–18 simultaneous decline in cooling hours and electricity use, and the distinction between ambient temperature and an AC setpoint.
- Q49: checked the CO₂ graph's roughly five seasonal cycles against the explanatory passage. Retained its dedicated graph; the question does not disclose the period count in the stem.
- Q50: checked the photosynthesis equation and proportional-change reasoning: similar absolute seasonal gas changes yield a far smaller percentage change against O₂'s much larger atmospheric baseline.
- Found a real offline defect during cache review: Q49's graph was present in the pre-reset precache literal but had been dropped by the later curated `ASSETS.splice` replacement. Added it to the active precache list and incremented the service-worker cache to v7.5.106.
- Added regression checks for answer sequence, four-option and worked-solution completeness, text-versus-figure dependencies, and Q49's online/offline graph requirement. Full validation and build checks are pending after this repair.
- Sources: [official 113 exam index](https://cap.rcpet.edu.tw/exam/113/113exam.html); [official answer table](https://cap.rcpet.edu.tw/exam/113/113_answer.html).
- Limitation: this is source-based AI review, not named qualified-teacher sign-off.
- 2026-10-06 recheck: verified the Q49 graph is again present in the current service-worker asset list (cache version v7.5.180), not only the old pre-reset precache entry.
- Added `scripts/validate-official-science-113-q41-q50.mjs` to validate the official answer sequence, every item’s metadata/steps, Q41 enzyme schedule, Q44 generation mix, Q45 pollutant values, Q46–48 paired annual dataset, and Q49 image + offline precache. Chained into the Q31–40 validator.
- `npm test`, `npm run build`, and `git diff --check` completed successfully after this review (diff check only reports repository-wide LF/CRLF normalization warnings).
