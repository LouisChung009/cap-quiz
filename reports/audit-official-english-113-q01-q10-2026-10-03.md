# Official 113 English Q1–10 Audit

- Reviewed OFF-0703–0712 against the original 113 English exam page 1 and the official answer table.
- Official answer sequence Q1–10: A, C, B, B, D, D, B, D, C, D; existing answer indices match.
- Q1: verified the envelope is under the door, the plant is beside it, the sign is on it, and the umbrella is in the stand. Replaced the unnecessary whole-page display with a responsive crop of the source image; retained the picture because the item explicitly depends on it.
- Q2–6: checked neck pain preventing head movement, `proud of` after winning, `decide to leave` on the last office day, `bad weather` during a typhoon, and `it` referring to the walking activity.
- Q7: verified the affirmative agreement structure `and so do I`; clarified the explanation so it distinguishes the base verb `likes` from the auxiliary matching first-person `I` without presenting the sentence as a question.
- Q8–10: checked `still does` for a continuing refrigerator problem, `be lucky a second time` after winning, and `not as sharp as before` from the knife's poor cutting.
- Confirmed Q2–10 are self-contained text items and do not need duplicated page images. Added checks for keys, choices, worked steps, teacher tips, related vocabulary, the Q1 crop and its offline dependencies, and the corrected Q7 explanation.
- Full `npm test` passes, including official-key audits and 100,000 randomized draws; PWA build and output checks pass, including the Q1 responsive crop and offline source image; `git diff --check` passes.
- Sources: [official 113 English exam index](https://cap.rcpet.edu.tw/exam/113/113exam.html); [official answer table](https://cap.rcpet.edu.tw/exam/113/113_answer.html).
- Limitation: source-based AI review only; no named qualified-teacher sign-off.
