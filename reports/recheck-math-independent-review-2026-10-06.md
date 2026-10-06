# Mathematics independent-review reconciliation: 2026-10-06

## Confirmed repairs

- MAT-0267 contained two mathematically equivalent choices, `4/20` and `1/4`; changed the distractor to `3/20`, preserving the keyed answer 1/4. Added a check that all four numeric options have distinct values.
- MAT-0718 asked students to complete the square from expanded form `x²−4x+1`. The National Academy for Educational Research's Mathematics Curriculum Handbook lists F-9-2 as graph features and extrema of already vertex-form quadratic functions, while noting that completing the square for quadratic functions belongs to grade 10. Reframed this item to read the vertex directly from `y=(x−2)²−3`, and aligned its knowledge point and solution.

## Findings not reproduced in the current bank

- MAT-0988: 9 occurs three times, while 4 occurs twice; only 9 is the mode. The option claiming both are modes is incorrect, not a second correct answer.
- MAT-0991: the correct response is the complete pair `b=7` and `(x+4)`. Option A supplies the factor but pairs it with an incorrect coefficient, so it is not another complete correct answer. This is a partial-component distractor, not answer non-uniqueness.
- MAT-0773: the current solution factors `x²+2x−15` as `(x+5)(x−3)`, obtains the roots directly, and computes the reciprocal sum; it does not invoke Vieta's formulas. The proposed out-of-scope finding is therefore not established by the actual solution.
- MAT-0534: current solution uses the trapezoid area formula with the stated bases and height and obtains 88; the previously reported rhombus mismatch is stale.

## Validation

Added `scripts/validate-math-peer-review-repairs.mjs` and included it in the test suite. This remains an AI cross-review, not qualified teacher sign-off.

Curriculum source: [National Academy for Educational Research, Mathematics Curriculum Handbook](https://www.naer.edu.tw/upload/1/16/doc/2069/%E6%95%B8%E5%AD%B8%E9%A0%98%E5%9F%9F%E8%AA%B2%E7%A8%8B%E6%89%8B%E5%86%8A%28%E5%AE%9A%E7%A8%BF%E7%89%88%29.pdf).
