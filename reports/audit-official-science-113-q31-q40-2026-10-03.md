# Official 113 Science Q31–40 Audit

- Reviewed OFF-0855–0864 against the original official 113 Science pages 8–12, the required item figures, and the official answer table.
- Official answer sequence Q31–40: D, D, D, B, C, B, B, D, C, B; the existing answer indices match.
- Q31: checked the classroom orientation and two-month change in noon-light coverage; expanding then shrinking indoor coverage corresponds to crossing the winter solstice in Taiwan.
- Q32: recalculated pool solute mass as 8,400,000 L × 2.1×10⁻⁷ g/L = 1.764 g. Converting that amount to urine volume requires the urine's average acesulfame concentration; the rewritten question includes the concentration unit definition.
- Q33–34: checked kidney/urine formation and oxygen-flow inference, plus cube masses and submerged volumes (20, 30, 20, 10 cm³ respectively); Q33's stated labels and oxygen relation and Q34's complete table make their items self-contained without full-page scans.
- Q35–36: compared the station markers with the isoseism map (C is 2級, matching M=6.1) and verified the convex-lens ray options; kept only the necessary focused figures.
- Q37–39: checked equal generated H₂ implies equal HCl consumption, different starting-metal mass gives different total product mass, fixed work F×S leaves final kinetic energy unchanged, and binomial nomenclature searches by the genus Rhododendron.
- Q40: verified the iron workpiece is the cathode/negative electrode, copper is the anode/positive electrode, and CuSO₄ solution supplies Cu²⁺; the necessary apparatus choices remain visible.
- Added regression checks for the answer sequence, four-option completeness, worked-solution fields, required versus redundant figures, and offline-cache references. `npm run validate:quality`, the year-specific answer-table audit, and `git diff --check` pass. Full-suite/build verification remains pending after this addition.
- Sources: [official 113 Science exam](https://cap.rcpet.edu.tw/exam/113/113exam.html); [official 113 answer table](https://cap.rcpet.edu.tw/exam/113/113_answer.html).
- Limitation: this is source-based AI review, not named qualified-teacher sign-off.
- 2026-10-06: added `scripts/validate-official-science-113-q31-q40.mjs`, covering Q31–40 identity, answer keys, worked steps, source data, and required offline figures; chained into the Q21–30 validator.
