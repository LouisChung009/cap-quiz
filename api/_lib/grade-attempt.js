import { matchesResponse } from "../../question-validation.js";

export function gradeAttempt(question, submission) {
  if (!question || !submission || submission.subject !== question.subject) return null;
  if (question.type === "非選擇題") {
    if (!Array.isArray(submission.responseValues) || submission.responseValues.length !== question.responseParts?.length || submission.responseValues.some(value => typeof value !== "string")) return null;
    return question.responseParts.every((part, index) => matchesResponse(part, submission.responseValues[index]));
  }
  if (!Number.isInteger(submission.selectedAnswer) || submission.selectedAnswer < 0 || submission.selectedAnswer >= question.options?.length || question.options?.length !== 4) return null;
  return submission.selectedAnswer === question.answer;
}
