# Follow-up quality audit — 2026-10-04

- Fixed official SVG figure rendering: question figures now use accessible embedded-document rendering so SVGs that reference companion page images no longer become blank in image context. Added 13 reconstructed, text-grounded diagrams and routed 23 figure-dependent official questions to the appropriate figures; complete textual source data remains available as text without unnecessary scans.
- Diversified four number-variant math duplicates while keeping answer positions exactly balanced: MAT-0250 now tests cylinder total surface area; MAT-0692 uses a complementary probability event for an even dice product; MAT-0258 asks for an arithmetic-series sum; MAT-0606 asks for a regular hexagon's exterior angle. Updated item regression assertions and explanations.
- Replaced MAT-0923's repeated cube-volume calculation with a 3D scaling question requiring the cubic volume factor.
- English ENG-0921–0930 was reviewed for stem answerability, distractors, keys, explanations, worked steps, and teacher notes; no changes required in this pass.
- Full `npm test` passes across 6,108 records; randomized validation tested 100,000 draws with no within-round repeats. Digit-normalized candidate groups declined from 21 to 16 during this follow-up.
- This is internal AI-assisted review, not independent teacher sign-off. Qualified subject-teacher validation and production deployment remain pending.
