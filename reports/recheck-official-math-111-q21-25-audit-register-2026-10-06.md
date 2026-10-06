# 111 年數學 Q21–Q25 舊稽核登記複核（2026-10-06）

依 `reports/audit-official-math-111-q21-q25-2026-10-03.md` 既有官方來源覆核及 `scripts/validate-data-v2.mjs` 中五題答案／推理回歸斷言，核對 OFF-0338–0342。五題皆有四個選項、有效答案索引與解題步驟；需要圖示者有可讀本機素材。稽核 JSON 仍有五筆聲稱選項污染或解析空泛的舊 finding，現行題目證據與舊描述不符，故移除。

可重現檢查：`node scripts/clear-stale-math-audit-0338-0342.mjs`。這是 AI/程式複核，不是具名教師簽核；其餘數學登記、五科教師驗收及正式部署仍未完成。
