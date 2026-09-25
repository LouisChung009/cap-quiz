# Vercel 正式部署

## 已包含的部署設定

- `vercel.json` 保留靜態 PWA 路由，並將 `/admin` 導向管理首頁。
- `/api/health` 可用來確認 Vercel Functions 是否已正常上線。
- `/api/admin/dashboard` 預設不回傳任何學生資料；沒有管理員身分驗證時一律回傳 `401`。
- `admin/config.js` 預設為 `demo`，不包含任何帳號、資料庫網址或秘密。

## 在 Vercel 建立專案

1. 以 GitHub 帳號登入 Vercel，選擇 **Add New → Project**。
2. 匯入 `LouisChung009/cap-quiz`，Framework Preset 選擇 **Other**，Root Directory 保持 repository 根目錄。
3. 按 **Deploy**。部署完成後先開啟 `/api/health`；應收到 `status: ok`。
4. 將 Vercel 專案網址加入登入服務允許的 Redirect URL，再設定正式網域。

## 正式資料服務

Vercel 是網站與 API 執行環境，不應把資料庫連線字串、服務角色金鑰或管理員密碼寫進 `admin/config.js`。請在 Vercel Marketplace 建立 Postgres 整合（建議 Neon），並在專案的 Environment Variables 設定：

| 變數 | 用途 |
| --- | --- |
| `DATABASE_URL` | 僅供 Vercel Functions 連線 Postgres 的完整連線字串。 |
| `AUTH_ISSUER_URL` | 登入服務的發行者網址。 |
| `AUTH_AUDIENCE` | 管理 API 接受的受眾識別值。 |
| `AUTH_JWKS_URL` | 用來驗證登入權杖簽章的 JWKS 網址。 |

資料庫可沿用既有 `supabase/migrations/001_learning_analytics.sql` 的事件與每日統計資料模型，但須把 Supabase 專用的 `auth.users`、RLS policy 與 `auth.uid()` 改為選定登入服務對應的使用者 ID 驗證；這些資料庫密鑰只可在 Vercel Environment Variables 保存。

## 下一步：登入服務

請在 Vercel Marketplace 選一個支援 OIDC 的登入服務（例如 Clerk 或 Auth0），建立「學生」與「platform_admin」角色。完成後再將其 issuer、audience、JWKS 設為上述環境變數，並把管理員登入表單導向該服務。未完成這一步前，管理後台只會顯示匿名示範資料，不會誤曝露全平台兒童資料。
