# CryptoPets Production Architecture

CryptoPets 已重構為前後端分離的 Web3 遊戲架構。核心原則是：

```text
鏈上只處理 NFT 資產所有權
鏈下處理遊戲邏輯、玩家狀態、遠征獎勵、好友與社交資料
```

## 專案目錄

```text
/
├─ frontend/   Vite + Vue 3 + TypeScript 前端，部署到 Vercel
├─ backend/    Node.js + Express + TypeScript API，部署到 Render
├─ shared/     前後端共用 TypeScript 型別
├─ README.md   最外層架構、部署、安全與資料夾說明
├─ .env.example
├─ package.json
├─ package-lock.json
└─ render.yaml
```

## 各資料夾職責

### `frontend/`

玩家實際操作的遊戲介面。

負責：

- Vue 3 畫面、路由、互動與遊戲 UI
- MetaMask 錢包連線與簽名登入流程
- 呼叫 backend REST API
- 顯示玩家、寵物、遠征、商店、好友等資料
- 僅使用 `VITE_` 開頭的公開環境變數

不負責：

- 不計算正式遠征獎勵
- 不直接修改玩家進度
- 不持有 Supabase service role key
- 不信任瀏覽器傳入的時間、獎勵、EXP 或 stats

重要檔案：

- `frontend/src/api/`：前端 API client
- `frontend/src/composables/useWallet.ts`：MetaMask 簽名登入狀態
- `frontend/vercel.json`：Vercel 部署與安全 headers
- `frontend/.env.example`：前端公開環境變數範本
- `frontend/README.md`：遊戲玩法與原本專案說明

### `backend/`

CryptoPets 的可信任遊戲伺服器。

負責：

- Wallet signature verification login
- JWT API session
- 玩家資料查詢
- 遠征開始與獎勵領取
- 使用 server time 計算遠征是否完成
- 防止重複 claim
- 驗證所有 API input
- 寫入 Supabase PostgreSQL
- 未來可加入 NFT ownership verification

重要檔案：

- `backend/src/app.ts`：Express app、CORS、Helmet、安全 middleware
- `backend/src/routes/`：REST API 路由
- `backend/src/controllers/`：HTTP controller
- `backend/src/services/`：商業邏輯與 Supabase 操作
- `backend/src/middleware/auth.ts`：JWT 驗證
- `backend/supabase/schema.sql`：資料表、index、RLS policy
- `backend/.env.example`：後端機密環境變數範本

### `shared/`

前後端共用型別，避免 API response 與前端資料模型分歧。

負責：

- `PlayerProfile`
- `PlayerPet`
- `ExpeditionSummary`
- `ExpeditionReward`
- `FriendSummary`
- Auth API response types

重要檔案：

- `shared/src/index.ts`

## 架構大綱

```text
MetaMask
   │
   │ wallet signature
   ▼
frontend (Vercel)
   │
   │ REST API + JWT
   ▼
backend (Render)
   │
   │ service role, server-side validation
   ▼
Supabase PostgreSQL
```

區塊鏈互動只應用於：

- 驗證 NFT 擁有權
- 讀取鏈上 token / contract / owner 資訊
- 必要時執行資產交易或 mint/burn 流程

遊戲邏輯保留在 backend：

- expedition start / claim
- reward calculation
- EXP / stats / progression
- friends / friend requests
- marketplace 狀態
- anti-cheat validation

## API 大綱

Auth:

- `POST /auth/nonce`
- `POST /auth/login`

Player:

- `GET /player`

Expedition:

- `POST /start-expedition`
- `POST /claim-reward`

Social:

- `POST /add-friend`
- `GET /friends`

## Supabase 資料表

Schema 在 `backend/supabase/schema.sql`。

目前設計：

- `users`：wallet identity、username
- `auth_nonces`：wallet login challenge，避免重放簽名
- `pets`：off-chain pet metadata / stats / exp
- `expeditions`：遠征狀態、server time、claim reward
- `friends`：好友關係
- `friend_requests`：好友邀請

所有 table 都啟用 RLS。正式 game mutation 由 backend 使用 service role key 執行，service role key 不得暴露到 frontend。

## 環境變數

根目錄 `.env.example` 是總覽範本。

Frontend 只允許公開變數：

```text
VITE_API_BASE_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_CHAIN_ID
VITE_NFT_CONTRACT_ADDRESS
```

Backend 可使用機密：

```text
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
RPC_URL
NFT_CONTRACT_ADDRESS
CORS_ORIGIN
WEB3_LOGIN_DOMAIN
```

不要把 backend secrets 放進任何 `VITE_` 變數。

## 本機開發

安裝 dependencies：

```bash
npm install
```

建立 env：

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

建立 Supabase schema：

```text
在 Supabase SQL editor 執行 backend/supabase/schema.sql
```

啟動：

```bash
npm run dev:backend
npm run dev:frontend
```

Build：

```bash
npm run build
```

## 部署

### Vercel Frontend

Project root：

```text
frontend
```

設定：

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: 只設定 `VITE_` 開頭的公開變數

`frontend/vercel.json` 已加入：

- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Content-Security-Policy`

### Render Backend

Root directory：

```text
backend
```

設定：

- Build command: `npm install && npm run build`
- Start command: `node dist/index.js`

必要環境變數：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `WEB3_LOGIN_DOMAIN`

## 已修正的主要架構問題

- 原本 demo local arrays / Vue refs 是權威遊戲狀態，已改為 backend + database ownership
- 原本 wallet connect 只取得 address，已改為 nonce + MetaMask signature verification
- 遠征獎勵不再由 frontend 計算
- Claim 使用 backend server time
- Claim update 檢查 `status = 'started'`，避免重複領取
- Backend 使用 `zod` 驗證 input
- Backend secrets 不進 frontend bundle
- Supabase tables 全部啟用 RLS
