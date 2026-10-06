# 國文 CHI-0001–0100 重複題舊稽核登記複核（2026-10-06）

重查現行 `data/chinese.json` 的 CHI-0001–0100，100 個正規化題幹與 100 組選項各自唯一；`scripts/validate-chinese-review-repairs.mjs` 已設置相同範圍回歸斷言。因此舊稽核登記所稱「100 題完全是同一題，只改序號與選項位置」不符合目前資料，已清除該舊 finding。

可重跑檢查：`node scripts/clear-stale-chinese-duplicate-audit-0001-0100.mjs`。這只推翻「完全同題」的舊主張，不代表 100 題已完成語義多樣性、會考程度或真人教師審核。
