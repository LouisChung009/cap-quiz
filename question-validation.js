export function isChallengeQuestion(item) {
  if (!item || typeof item.question !== "string" || !item.question.trim()) return false;
  if (item.type === "非選擇題") {
    return Array.isArray(item.responseParts) && item.responseParts.length > 0 && item.responseParts.every(part => part && ((Array.isArray(part.acceptableAnswers) && part.acceptableAnswers.length > 0) || part.answer !== undefined));
  }
  return Array.isArray(item.options) && item.options.length === 4 && Number.isInteger(item.answer) && item.answer >= 0 && item.answer < 4;
}

export function matchesResponse(part, response) {
  const normalizedResponse = normalizeResponse(response);
  return (part.acceptableAnswers || [part.answer]).some(answer => normalizeResponse(answer) === normalizedResponse);
}

export function matchesDifficulty(item, selectedDifficulty) {
  if (!selectedDifficulty) return true;
  if (item?.difficulty === "易") return selectedDifficulty === "基礎";
  if (item?.difficulty === "中") return selectedDifficulty === "中等";
  if (item?.difficulty === "基礎至中等") return selectedDifficulty === "基礎" || selectedDifficulty === "中等";
  return item?.difficulty === selectedDifficulty;
}

export function normalizeResponse(value) {
  return String(value ?? "").normalize("NFKC").toLocaleLowerCase().replace(/[\s,，。]/g, "").replace(/[÷／]/g, "/");
}
