# Mathematics item repair: MAT-0991

## Finding

MAT-0991 repeated MAT-0814's direct `x² + bx + c` factorization prompt, changing only the coefficients.

## Repair

MAT-0991 now supplies a known factor `(x + 3)` and constant term 12, asking students to infer the other factor and coefficient `b`. The solution derives `3×□=12`, then `b=3+4=7`, and expands to verify. Four unique paired-response options are included; the correct answer remains at D to preserve the exact answer-position distribution.

## Checks

- Answer index, distinct options, metadata, and solution steps verified.
- Dedicated `validate-math-factor-parameter-0991.mjs` regression test passes.
- Full `npm test`, duplicate-variant scan, and `git diff --check` pass.
- Duplicate-template candidates reduced from 6 groups / 12 items to 5 / 10.

Internal review only; qualified teacher sign-off remains pending.
