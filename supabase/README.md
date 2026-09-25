# Supabase 上傳準備

這個資料夾可直接作為 Supabase 專案的資料庫 migration 與 Edge Functions 來源。GitHub Pages 只可保存 `admin/config.js` 的公開 URL 與 anon key；`SUPABASE_SERVICE_ROLE_KEY` 只能設定在 Supabase Edge Function secrets。

## 一次性設定

1. 在 Supabase 建立新專案，於 Authentication 設定 Email/Password 登入。
2. 在 SQL Editor 或 Supabase CLI 執行 `migrations/001_learning_analytics.sql`。
3. 建立一名管理員使用者，再將其 `profiles.role` 更新為 `platform_admin`。
4. 將 `functions/` 部署為 `ingest-learning-events` 與 `admin-dashboard`。
5. 於 Supabase 設定 secrets：`SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`。
6. 將 `admin/config.example.js` 複製為 `admin/config.js`，填入專案 URL 與公開 anon key，並將 `mode` 設為 `supabase`。

## CLI 指令

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
supabase secrets set SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_KEY
supabase functions deploy ingest-learning-events
supabase functions deploy admin-dashboard
```

## 安全檢查

- 管理員登入後仍必須由 Edge Function 驗證 `platform_admin` 角色。
- `service_role` key 不得進入瀏覽器、GitHub Pages、Git 或任何使用者裝置。
- 事件插入使用 `event_id` 去重；只接受已登入學生自己的事件。
- 管理 API 只回傳分析所需欄位，預設以匿名代號呈現。
