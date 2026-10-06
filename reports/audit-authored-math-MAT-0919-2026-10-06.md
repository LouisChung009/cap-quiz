# Mathematics item repair: MAT-0919

## Finding

MAT-0919 repeated MAT-0876's adult/student ticket sum-and-difference template, changing only the total and price difference and asking for adult-ticket price.

## Repair

MAT-0919 now gives two package totals: `2a+s=19` and `a+2s=17` (hundreds of dollars). Subtracting the equations gives `a-s=2`, the requested ticket-price difference. Substitution confirms adult and student prices are 7 and 5 hundred dollars. The correct choice remains A to preserve exact 250-per-position answer balance.

## Checks

- Four distinct options; answer index points to `2 百元`.
- Dedicated `validate-math-ticket-bundle-elimination-0919.mjs` covers both equations, the difference, and the item's distinct context.
- Full `npm test`, duplicate-variant scan, and `git diff --check` pass.
- Duplicate-template candidates reduced from 5 groups / 10 items to 4 / 8.

Internal review only; qualified teacher sign-off remains pending.
