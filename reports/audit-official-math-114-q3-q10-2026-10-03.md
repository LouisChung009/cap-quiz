# Official 114 Math Q3–10 Audit

- Checked OFF-0962–OFF-0969 against the official 114 Math scans, pages 1–4, and checked answer indices against the official answer table.
- Q3: retained the necessary line-segment diagram, replacing the whole-page scan with a focused vector figure that reproduces the eight equal segments and four labels. Answer C matches the official key.
- Q4: verified elimination gives `x = 2`, `y = 3.5`, and `x + 2y = 9`.
- Q5: made all angle placements explicit in text (∠BAD, ∠DAC, ∠ABD, ∠ADC, ∠ACB); removed the redundant full-page image. Triangle-angle reasoning gives 160°.
- Q6: verified directional changes from (−1, 2): right increases x and down decreases y; only (4, 1) fits.
- Q7: transcribed the three needed 60+ age-group changes (−109, +112, +204 ten-thousands) and removed the full-page chart scan; the net increase is 207 ten-thousands.
- Q8: verified radical distribution and simplification; Q9: counted 19 shared adjacent alighting spaces among 20 stalls; Q10: factored all choices and confirmed B, C, D share the same four factors while A differs.
- Added regression checks to require text-complete Q5/Q7 without full-page scans. Full `npm test` and `git diff --check` pass after edits; deployment and credentialed teacher validation remain outstanding.
