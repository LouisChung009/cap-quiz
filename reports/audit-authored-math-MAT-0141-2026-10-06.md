# Mathematics item repair: MAT-0141

## Finding

MAT-0141 repeated MAT-0012's direct integer-coefficient equation-solving pattern with only different coefficients and constants.

## Repair

MAT-0141 now asks students to solve `(3/4)(2x−8)=x+7`. The three-step solution clears the denominator, applies the distributive property, isolates `x=26`, and verifies both sides in the original equation. Difficulty was raised to medium. Correct answer remains D to preserve the exact 250-per-position distribution.

## Checks

- Four distinct options; answer index points to `26`.
- Dedicated `validate-math-fraction-coefficient-0141.mjs` covers the fraction coefficient, distribution, answer, and distinct stem.
- Full `npm test`, duplicate-variant scan, and `git diff --check` pass.
- Duplicate-template candidates reduced from 3 groups / 6 items to 2 / 4.

Internal review only; qualified teacher sign-off remains pending.
