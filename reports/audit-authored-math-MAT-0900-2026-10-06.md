# Mathematics item repair: MAT-0900

## Finding

MAT-0900 repeated MAT-0602's one-step inverse-area question with different numbers. Both only required dividing area by a known side.

## Repair

MAT-0900 now gives a rectangle's perimeter and the difference between its sides, then asks for area. Students must halve the perimeter to obtain the side sum, solve the resulting linear equation for both sides, and multiply them. The item is rated medium.

## Checks

- Four distinct options; answer index points to `54 平方公分`.
- Three solution steps show perimeter relation, side derivation, and area calculation.
- Dedicated `validate-math-rectangle-perimeter-0900.mjs` test passes.
- Full `npm test`, duplicate-variant scan, and `git diff --check` pass.
- Duplicate-variant candidates reduced from 9 groups / 18 items to 8 / 16.

Internal review only; qualified teacher sign-off remains pending.
