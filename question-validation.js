export function isChallengeQuestion(item) {
  if (!item || typeof item.question !== "string" || !item.question.trim()) return false;
  if (item.type === "非選擇題") {
    return Array.isArray(item.responseParts) && item.responseParts.length > 0 && item.responseParts.every(part => part && ((Array.isArray(part.acceptableAnswers) && part.acceptableAnswers.length > 0) || part.answer !== undefined));
  }
  return Array.isArray(item.options) && item.options.length === 4 && Number.isInteger(item.answer) && item.answer >= 0 && item.answer < 4;
}

export function matchesResponse(part, response) {
  const normalizedResponse = normalizeResponse(response);
  const acceptableAnswers = part.acceptableAnswers || [part.answer];
  if (part.requiredTerms?.length) {
    const includesAnswer = acceptableAnswers.some(answer => normalizedResponse.includes(normalizeResponse(answer)));
    return includesAnswer && part.requiredTerms.every(term => normalizedResponse.includes(normalizeResponse(term)));
  }
  return acceptableAnswers.some(answer => normalizeResponse(answer) === normalizedResponse);
}

export function matchesDifficulty(item, selectedDifficulty) {
  if (!selectedDifficulty) return true;
  if (item?.difficulty === "易") return selectedDifficulty === "基礎";
  if (item?.difficulty === "中") return selectedDifficulty === "中等";
  if (item?.difficulty === "基礎至中等") return selectedDifficulty === "基礎" || selectedDifficulty === "中等";
  return item?.difficulty === selectedDifficulty;
}

export function matchesSource(item, selectedSource) {
  if (selectedSource === "official") return item?.sourceType === "官方歷屆真題";
  if (selectedSource === "similar") return item?.sourceType === "依114年官方真題能力指標原創";
  if (selectedSource === "original") return item?.sourceType !== "官方歷屆真題" && item?.sourceType !== "依114年官方真題能力指標原創";
  return true;
}

export function normalizeResponse(value) {
  return String(value ?? "").normalize("NFKC").toLocaleLowerCase().replace(/[\s,，。]/g, "").replace(/[÷／]/g, "/");
}
