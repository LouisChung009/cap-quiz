# Cloudflare 部署

此專案可先以 Cloudflare Pages 或 Workers Static Assets 部署 PWA 與管理後台原型。R2 是物件儲存，適合放大型圖片或附件，但不負責登入與管理 API；管理 API 應以 Supabase Edge Functions 或 Cloudflare Worker 實作。

## 建議架構

| 功能 | 服務 |
| --- | --- |
| 刷題 PWA 與 `/admin/` 介面 | Cloudflare Pages 或 Workers Static Assets |
| 管理員登入、作答事件、統計查詢 | Supabase Auth + Edge Functions |
| 大型圖像／日後上傳素材 | Cloudflare R2 |

## Cloudflare Pages（建議）

1. 在 Cloudflare Dashboard 開啟 **Workers & Pages** → **Create application** → **Pages**。
2. 連結 `LouisChung009/cap-quiz` GitHub repository。
3. 選擇 `main` 分支，Build command 留空，Build output directory 設為 `/`。
4. 部署後，`/admin/` 即為管理後台入口；尚未設定 Supabase 時只顯示匿名示範資料。

## Workers Static Assets（CLI 選項）

安裝並登入 Wrangler 後：

```bash
npm install -D wrangler
npx wrangler login
npx wrangler deploy
```

`wrangler.jsonc` 已準備好靜態資產設定。部署前請確認不會把任何 Supabase secret key 寫入 `admin/config.js`。
