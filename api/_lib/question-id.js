const standardQuestionId = /^[A-Za-z]+-[0-9]{4}$/;
const officialMathQuestionId = /^OFF-MATH-[0-9]{3}-Q[0-9]{2}-MC$/;

export function isValidQuestionId(value) {
  return typeof value === "string" && (standardQuestionId.test(value) || officialMathQuestionId.test(value));
}
