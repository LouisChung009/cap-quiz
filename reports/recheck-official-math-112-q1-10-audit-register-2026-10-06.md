# 112 年數學 Q1–Q10 舊稽核登記複核（2026-10-06）

依 `reports/audit-official-math-112-constructed-response-2026-10-03.md` 與 `reports/audit-official-math-112-q1-q10-2026-10-03.md` 的官方來源核對，檢查目前 OFF-0532–0541：年份、題號正確；兩道非選有多小題及計算步驟；八道選擇題有四個選項與答案索引；必要圖片均有本機檔案。對應舊稽核登記仍指稱通用解析、選項/OCR 污染或缺圖，與目前題目及既有回歸斷言不符，故移除十筆舊 finding。

可重現檢查：`node scripts/clear-stale-math-audit-0532-0541.mjs`。這是 AI／程式複核，並非具名教師簽核；其餘數學稽核項目、五科真人逐題驗收及部署仍未完成。
