# English follow-up audit — 2026-10-04

- Rechecked ENG-0931–0940 against stems, answer keys, explanations, worked steps, and teacher notes. Corrected ENG-0931, whose revised `since 2023` stem still had leftover `for three years` language in its explanation and first solution step; added regression coverage for the mismatch.
- Reviewed ENG-0941–0950 and ENG-0971–0980; no additional defects found in those sampled ranges.
- Reviewed ENG-0961–0970. Corrected ENG-0962's teacher note, which referenced a word absent from the stem, and ENG-0965's explanation, which relied on `famous for` although that phrase does not appear in the question. Added regression checks for both.
- Reviewed ENG-0981–0990; no additional answerability, key, or explanation defects found in this pass.
- Full `npm test` and `git diff --check` pass after the corrections.
- Internal AI-assisted review only; this is not qualified English-teacher sign-off. Overall five-subject review and production release remain incomplete.
