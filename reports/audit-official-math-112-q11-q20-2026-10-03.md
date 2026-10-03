# Official Mathematics audit: 112年選擇題 Q11–20

- Compared items with official exam scans `assets/official-exams/112-math-p4.webp` through `p8.webp`, including the folded-circle arc diagram and angle-bisector/perpendicular-bisector diagram.
- Rechecked Q11 caffeine bounds (two medium cups exceed 300 mg but do not exceed 400 mg), independent box-toy probability, right-prism angle comparisons, parabola symmetry, arithmetic-sequence term count, promotion-price equations, grid circumcenter distance, capped parking fee, fold reflection, and the isosceles-triangle angle relations.
- Q15, Q17 and Q18 contained OCR/duplicated option fragments in their stems; removed the fragments while retaining the separate answer choices. Q16's first solution step was a truncated copy of the stem; replaced it with the variable definitions and equations.
- Q19 had lost the arc marks on BC and AD, and its solution incorrectly treated 35° as an inscribed angle. Restored the arc notation and the fold-reflection derivation: arc D′B = arc BC = 35°, and the semicircle gives arc AD′ = 180°−35°−35° = 110°; the folded corresponding arc AD has the same measure. Official answer remains B.
- Q20's earlier explanation incorrectly called angle 2 and angle 4 base angles of the isosceles triangles. Replaced it with the actual derivation: ∠1=2β, ∠3=2γ; ∠2=180°−β−γ=∠A=∠4; distinct triangle angles imply β≠γ.
- Replaced generic teacher tips on Q11, Q13 and Q16, Q18–20; added targeted regression assertions for the corrected derivations and tips. Full `npm test`, official-key audits, 10,000 × 10 random-draw checks, and `git diff --check` pass.
- AI/source review only; no credentialed teacher sign-off is claimed. Other years/ranges, constructed-response audit, teacher validation, and deployment remain open.
