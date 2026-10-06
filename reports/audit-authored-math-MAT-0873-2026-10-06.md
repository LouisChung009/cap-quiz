# Mathematics item repair: MAT-0873

## Finding

MAT-0873 duplicated MAT-0853's one-draw inclusive-union probability template, changing only the two divisors and sample range.

## Repair

MAT-0873 now asks for exactly one of two conditions (multiple of 2 or multiple of 3) among integers 1–20. The sets contain 10 and 6 values and overlap in 3 values. Since overlap values satisfy neither the exclusive outcome, subtract the intersection twice: `10+6−2×3=10`; probability is `10/20=1/2`. Correct answer remains A to preserve the exact 250-per-option distribution.

## Checks

- Four distinct options and answer index verified.
- Dedicated `validate-math-exclusive-multiples-0873.mjs` covers exclusive-or semantics and twice-subtracted intersection.
- Full `npm test`, digit-normalized duplicate scan, and `git diff --check` pass.
- Duplicate-template candidates decreased from 4 groups / 8 items to 3 / 6.

Internal review only; qualified teacher sign-off remains pending.
