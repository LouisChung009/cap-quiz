# 會考刷題 PWA V2

iPad、iPhone、Android 與桌面瀏覽器皆可使用的國中教育會考練習 PWA。五科各 1,000 題，共 5,000 題。

## V2 功能

- 國文、英文、數學、自然、社會各自使用獨立 JSON 題庫。
- 可依科目、難度與單元篩選。
- 冒險模式提供每回合 10 題、5 顆愛心、連擊 XP 加成、每日 20 題目標、連續學習天數與回合結算。
- 錯題庫、累計作答與正確率保存在瀏覽器本機。
- `review` 本機資料已預留間隔天數、重複次數、熟練係數、上次與下次複習時間欄位。
- Service Worker 採網路優先、離線快取備援，避免舊版程式造成進度停留或題目重複。
- 每回合建立不重複題袋，畫面即時顯示 `0 / 10` 到 `10 / 10`；答錯後仍會顯示正解與解析。
- 答題可獲得陽光、露珠與種子，孵化五種原創芽靈，並建造個人花園。
- 可編成三隻芽靈探索隊，探索草原與遺跡、收集並裝備隱藏道具。
- Service Worker 快取介面、五科題庫與原創美術，可加入 iPad 主畫面並離線使用。

## 原創美術資產

- `assets/spirit-garden-world.png`：芽靈世界與個人花園主視覺。
- `assets/spirit-roster.png`：五種芽靈角色圖鑑。
- `assets/seeds-and-relics.png`：種子與探索裝備收藏圖。

## 題目格式

每題包含 `id`、`subject`、`gradeSemester`、`unit`、`knowledgePoint`、`difficulty`、`type`、`question`、四個 `options`、零起算的 `answer`、`explanation`、`sourceType`，以及供日後間隔複習使用的 `review` 欄位。

## 維護題庫

```bash
node scripts/generate-data.mjs
node scripts/validate-data.mjs
```

題目皆為程式化產生的原創練習題，不冒充官方歷屆試題。產生後會檢查總題數、缺欄、重複題幹、答案索引、選項數量、選項重複與 ID 唯一性。

## GitHub Pages

本 repository 使用 `main` 分支根目錄發布。網址：<https://louischung009.github.io/cap-quiz/>

iPad 請使用 Safari 開啟，再選「分享 → 加入主畫面」。
