# Official 114 Math Q11–18 Audit

- Checked OFF-0970–0977 against official 114 Math scans, pp. 4–8, and verified answer indices against the official key.
- Q11 transcribed both players' visible cards so the hidden-card sample spaces can be reconstructed without the scan; 6 of 9 equally likely pairs win, so probability is 2/3.
- Q12 checked the triangular-pyramid side-face edge compatibility; Q13 verified real-root behavior; Q14 solved the combo-revenue equation (65 sets, NT$4,550).
- Q15 rewrote the number-line constraints in text and confirmed the root lies between B and C, closer to C. Q16 checked similarity ratios and the midpoint comparison; Q17 transcribed the 60° cross-section and H/8, H/4 truncations, yielding 5√3/16; Q18 checked gcd/lcm divisibility constraints.
- Removed redundant whole-page scans from Q11, Q15–18 and added regression assertions that require all answer-critical conditions in text. Official-key order: B, D, A, C, B, D, D, B.
- Full `npm test` and `npm run build` pass; the generated Q3 diagram is included under `public/assets/official-exams/`. This is source-based review, not credentialed teacher approval.
