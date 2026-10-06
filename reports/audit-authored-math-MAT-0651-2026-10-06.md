# Mathematics item repair: MAT-0651

## Finding

MAT-0651 and MAT-0646 both had bare numeric fraction-addition prompts. They targeted different denominator skills, but MAT-0651 did not distinguish itself with any application or follow-up reasoning.

## Repair

MAT-0651 now describes a hiker who walks `2/7` of a trail in the morning and another `2/7` in the afternoon, asking for the unwalked fraction. Students add like-denominator fractions to get `4/7`, then subtract from the whole `1` to find `3/7`. Correct answer remains D to preserve exact answer-position balance.

## Checks

- Four distinct options; answer index points to `3/7`.
- Dedicated `validate-math-fraction-remaining-0651.mjs` checks the two-step addition/complement reasoning.
- Full `npm test`, exact answer distribution, digit-normalized duplicate audit (0 groups / 0 items), and `git diff --check` pass.

Internal review only; qualified teacher sign-off remains pending.
