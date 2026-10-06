# 國文 OFF-0261–0263、OFF-0269–0272 材料缺漏舊 finding 複核（2026-10-06）

逐題檢查現行 `data/mission-questions.json`：OFF-0261–0263 題幹內含《摺紙》／《瘟疫》閱讀材料；OFF-0269–0270 題幹內含柏拉圖洞穴寓言，OFF-0271–0272 含甲乙資料。七題均有四選項與至少三步解題內容，材料隨題存放，不依賴未顯示的前一題或 `requiresImage`。因此從稽核登記移除兩筆「隨機單題無法作答」舊 finding。

可重跑檢查：`node scripts/clear-stale-chinese-material-audit-0261-0272.mjs`。這只確認現行題幹自足及格式欄位，不替代文章逐字校勘或教師簽核。
