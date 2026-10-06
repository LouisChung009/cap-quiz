# Mathematics item repair: MAT-0605

## Finding

MAT-0605 and MAT-0660 were numeric variants of the same direct prompt: identify the positive solution of `x² = n`. The duplicate-stem audit correctly grouped them even though the radicands differed.

## Repair

MAT-0605 now uses a square-area context: a square display board has area 64 cm² and its side length is positive. The solution sets `x² = 64`, considers both square roots, rejects the negative value because it cannot be a length, and selects 8 cm. This retains the square-root learning objective while requiring translation from area and contextual validation. Difficulty was raised to medium.

## Checks

- Four distinct options; answer index points to `8 公分`.
- Three solution steps cover area equation, both roots, and positive-length condition.
- Dedicated `validate-math-square-root-context-0605.mjs` regression test passes.
- `npm run validate:data`, full `npm test`, duplicate-variant scan, and `git diff --check` pass.
- Duplicate-variant candidates reduced from 10 groups / 20 items to 9 / 18.

Internal review only; qualified teacher sign-off remains pending.
