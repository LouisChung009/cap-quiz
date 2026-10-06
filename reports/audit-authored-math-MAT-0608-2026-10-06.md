# Mathematics item repair: MAT-0608

## Finding

MAT-0608 repeated MAT-0567's direct prompt asking for the greatest common divisor. Although the methods differed (prime factorization versus Euclidean algorithm), the question asked the same standalone fact.

## Repair

MAT-0608 now asks how many equal, no-leftover pieces can be cut from 84 cm and 126 cm ribbons when each piece should be as long as possible. Students must find the GCD as the 42 cm piece length, divide both ribbon lengths by 42, and sum 2+3=5 pieces. The item explicitly distinguishes segment count from segment length. It remains at answer position A, preserving exact answer-position balance.

## Checks

- Four distinct options; answer index points to `5 段`.
- Dedicated `validate-math-gcd-ribbon-0608.mjs` verifies the GCD, piece count, and count-versus-length distinction.
- Full `npm test`, duplicate-variant scan, and `git diff --check` pass.
- Candidate scan still reports two groups / four items; the other pair involving fraction addition tests distinct subskills (unlike denominators versus like denominators).

Internal review only; qualified teacher sign-off remains pending.
