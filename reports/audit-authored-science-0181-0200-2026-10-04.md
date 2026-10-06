# Science authored-bank audit: SCI-0181–0200

- Reviewed all 20 prompts for scientific reasoning, answer index, distractors, worked steps, and metadata.
- Corrected subject-unit metadata for SCI-0188 (pressure: physics), SCI-0189 (convex lens: physics), and SCI-0197 (stratigraphy: earth science).
- Confirmed SCI-0176–0180 had already been audited in the SCI-0161–0180 batch; no redundant review was counted.
- Added `scripts/validate-science-0181-0200.mjs` to assert keyed answer positions, four choices, required explanation steps, and the three corrected subject units.
- Full `npm test` passes across all 6,108 records; `git diff --check` passes.
- This is internal review only, not qualified-teacher sign-off.
