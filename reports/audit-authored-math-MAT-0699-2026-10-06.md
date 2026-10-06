# Mathematics item repair: MAT-0699

## Finding

MAT-0699 and MAT-0625 both presented a monic quadratic, asked students to factor it, and selected the larger root; only the constant term changed.

## Repair

MAT-0699 now gives one root of `x² + kx + 6 = 0` and asks for the other root and `k`. Students use product of roots, sum of roots, and substitution to verify. Four distinct paired-response options are provided. The correct option is D to preserve the bank's exact 250-per-position answer-key balance.

## Checks

- Answer index and paired root/parameter value verified.
- Three solution steps cover product, sum, and substitution checks.
- Dedicated `validate-math-root-parameter-0699.mjs` regression test passes.
- Full `npm test`, digit-normalized duplicate audit, and `git diff --check` pass.
- Duplicate-template candidates reduced from 8 groups / 16 items to 7 / 14.

Internal review only; qualified teacher sign-off remains pending.
