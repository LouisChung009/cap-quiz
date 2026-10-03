# Official Mathematics audit: 112年選擇題 Q21–25

- Compared Q21–23 with official scan `assets/official-exams/112-math-p9.webp` and Q24–25 with `p10.webp`; retained the necessary focused figures for the rectangle/triangle geometry items and the aging-population graph.
- Q21: verified equal-step-distance conversion (84/70 × 60 = 72). Q22: simplified the coordinate-heavy solution to an area difference (△EBC = 6+8 = 14), derive E's height as 7, then use △EFG ∼ △EBC to obtain FG:BC = 3:7. Q23: rechecked the quadratic distance minimization, yielding 24/5. Q25: verified the six-percentage-point increase gives 2,300×0.06 = 138 萬人.
- Q24: corrected the unsupported year estimates in the prior explanation. It now compares each line's horizontal x-axis span between the 14% and 20% crossings and identifies Korea's interval as shortest, without asserting inaccurate crossing years. The focused graph remains attached.
- Replaced generic teacher tips for Q22–25 and added regression assertions for the area/similarity derivation, graph-based comparison, answer index, and item-specific tips.
- Full `npm test`, all five years of official answer-key checks, 10,000 × 10 randomized draws (zero within-round repeats), `git diff --check`, and production static-PWA build pass. AI/source review only; no qualified teacher sign-off is implied.
