# Official Chinese question recheck: OFF-0684

- Compared OFF-0684 (113 Chinese Q24) against the local official scan `assets/official-exams/113-chinese-p7.webp`, printed page 6.
- The scan reads `使女工繅之，以為美錦，國君服而朝之。身者，繭也` and ends the following clause with `則天下諸侯莫敢不敬`; OCR artifacts had inserted `1` before `身者` and split phrases with stray spaces.
- Corrected the transcription, retained the glossary as a separate visible paragraph in the question text, and confirmed none of the four options contains glossary/page-control text.
- Added `scripts/validate-chinese-official-0684.mjs` to the quality validation suite.
- This is an internally verified transcription repair, not an independent teacher sign-off.
