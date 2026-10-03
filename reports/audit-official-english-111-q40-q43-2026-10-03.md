# 111 English Q40–43 Source Audit

- Source checked: original exam page 13, preserved locally as `assets/official-exams/111-english-p14.webp`; recorded official answer-table provenance is on each question record.
- Questions checked: OFF-0314–OFF-0317, the complete Palindromes and Anagrams reading passage and four option sets.
- Verified answer sequence: D/C/A/A. The two anagram examples preserve the exact source letter groups; Q42 uses “restaurant” → “Eat rats, run!” to support “strange”; Q43 is supported by the later mathematics, music, and information-hiding uses.
- Presentation: all required passage content is present in each stem; no question depends on displaying a full-page scan.
- Repairs: removed duplicate English `Answer: X` tails from explanations; added explicit synonyms/near-synonyms and a confusion warning for `strange` (odd/unusual, not difficult), plus `more than just` (not merely).
- Regression guards: assert source year/question numbers, official key sequence, four options, complete passage, text-only status, verified key provenance, explanation/solution/tip presence, and synonym/confusion notes.
- Validation: full `npm test` passed (6,108 records, unique IDs, 100,000 random picks with no within-round repeats, content/template checks and five-year official key checks).
- Limitation: source-based review is not an independent qualified English-teacher sign-off.
