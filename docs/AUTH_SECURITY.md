# 帳號與資安設計

## 帳號流程

- 學員由監護人電子郵件建立帳號，必須完成驗證後才能同步學習資料。
- 登入、註冊與忘記密碼統一轉交受管身分服務；靜態網站與 Git repository 不接觸密碼。
- 帳號服務完成 OIDC 登入後，Vercel API 只接受短效、伺服器驗證過的身分權杖；登入 cookie 必須是 `HttpOnly`、`Secure`、`SameSite=Strict`。
- 平台資料 API 每個請求都檢查身分與角色；學生只能讀寫自己的紀錄，`platform_admin` 才能讀取匿名彙總看板。

## 上線前必做

1. 在 Vercel Marketplace 建立受管登入服務（建議 Clerk 或 Auth0）與 Neon Postgres。
2. 在 Vercel Environment Variables 設定 `AUTH_START_URL`、OIDC issuer／audience／JWKS 與 `DATABASE_URL`；不得將其寫入前端檔案。
3. 對註冊、登入、寄送重設信加上 provider 端 rate limit、CAPTCHA／bot protection、電子郵件驗證與一次性、短效重設連結。
4. 建立 Postgres 使用者、作答與稽核資料表，以參數化查詢存取；不要拼接 SQL。
5. 部署前執行依賴漏洞掃描，並在管理 API 上測試未登入為 `401`、非管理員為 `403`、不合法輸入為 `400`。

## 已啟用的網站防護

- CSP、禁止 iframe 嵌入、MIME sniffing、限制 referrer 與瀏覽器功能權限。
- API 回應禁止快取，避免登入或分析資料被中介快取保存。
- 前端不保存密碼、token 或資料庫連線字串。
