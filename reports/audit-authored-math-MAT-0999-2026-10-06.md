# Mathematics item repair: MAT-0999

## Finding

MAT-0999 duplicated MAT-0816's one-draw probability of selecting a multiple, changing only the interval and divisor.

## Repair

MAT-0999 now asks for the probability of drawing at least one multiple of 3 in two draws without replacement from cards numbered 1–30. It uses the complement: both cards are nonmultiples, with probability `20/30 × 19/29 = 38/87`; the requested probability is `1 − 38/87 = 49/87`. The answer key remains at C to preserve the exact per-position balance.

## Checks

- Four distinct options; answer index points to `49/87`.
- Three solution steps explain complement selection and the changed second-draw denominator.
- Dedicated `validate-math-multiples-without-replacement-0999.mjs` regression test passes.
- Full `npm test`, duplicate-variant scan, and `git diff --check` pass.
- Duplicate-template candidates reduced from 7 groups / 14 items to 6 / 12.

Internal review only; qualified teacher sign-off remains pending.
