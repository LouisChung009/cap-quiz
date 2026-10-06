# Official Chinese table readability repair: 113 Q4

- Compared OFF-0664 with the official 113 Chinese Q4 table on `assets/official-exams/113-chinese-p2.webp`.
- Kept the table as selectable text rather than adding an unnecessary paper screenshot. Rewrote it as four explicitly labeled rows, each retaining the three original fields: question, A-Bao's position, and response.
- Added a regression test that verifies all four rows, source question number, answer key, and worked solution.
- Removed the stale audit finding after confirming the flattened-cell issue no longer applies. Full automated validation remains required; this is not independent teacher sign-off.
