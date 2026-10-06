# 112 年會考英文第 1–23 題再核對（2026-10-06）

- 對照本機原卷掃描 p2–p3、答案表檢核記錄與 OFF-0489–OFF-0511 題目資料；官方答案序列為 B/D/D/B/A/B/A/C/C/D/D/C/C/C/D/C/C/B/D/C/A/B/D。
- Q1–10：核對葡萄籃插圖（必要插圖本身與來源頁已列入 Service Worker 快取）、voice/singing、shout、watch + O + V-ing、colors、was jogging、think about V-ing、full、or「否則」、why 間接問句。全部題幹、四選項、答案與詳解一致。
- Q11–23：核對 a headache、近期行程 are going、耳朵 were bitten、第一類條件句、service、官方原題用語 less possible、finally、make things worse、the one who、過去練習、expect、現在完成 has saved、used to 描述往日習慣。原卷文字題可直接作答，不需附整頁試卷圖。
- Q20 解析修訂：承認 would practice 可表示過去習慣；說明題目沒有慣常頻率／反覆情境線索，官方答案 C practiced 是直接敘述已結束練習經歷的預期答案，避免錯稱 D 不合文法。
- `less possible` 維持原卷原句，不自行改題；解釋按可能性下降閱讀，並與 less difficult 的語意方向區分。
- `scripts/validate-data-v2.mjs` 新增 Q1–23 每題原卷線索斷言，沿用答案表序列、四選項、專屬提醒與答案核對狀態檢查。
- 驗證：`node scripts/validate-data-v2.mjs` 通過 6,108 題唯一 ID 與五科題庫檢查；`node scripts/audit-112-official-answer-table.mjs` 對官方表 43/43 零差異；`git diff --check` 通過（Windows 換行提示除外）。
- 限制：本批是內部原卷／資料／自動回歸檢查，不是合格英文教師具名簽核。112 年英文後續題目與其餘科目尚待逐題審核。
