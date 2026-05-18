# CryptoPets Backend

CryptoPets 後端是 Express + TypeScript API server，負責錢包簽名登入、玩家資料、遠征、市場、交易與好友等服務。專案最終會以上鏈資料為準，後端資料庫主要作為驗證、快取、索引與非鏈上輔助資料。

## 開發資訊

- Dev server: `http://localhost:3400`
- Framework: Express
- Language: TypeScript
- Database: Supabase PostgreSQL
- Web3 library: ethers

## 啟動方式

在專案根目錄執行：

```bash
npm run dev:backend
```

或在 `backend/` 目錄執行：

```bash
npm run dev
```

建置：

```bash
npm run build
```

啟動建置後版本：

```bash
npm run start
```

型別檢查：

```bash
npm run type-check
```

## 環境變數

請由 `backend/.env.example` 建立 `backend/.env`。

```text
NODE_ENV=development
PORT=3400
CORS_ORIGIN=http://localhost:5400
JWT_SECRET=replace-with-a-long-random-secret

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

WEB3_LOGIN_DOMAIN=localhost:5400
WEB3_LOGIN_STATEMENT=Sign in to CryptoPets

RPC_URL=https://mainnet.infura.io/v3/your-key
NFT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
CHAIN_ID=1
```

注意：`SUPABASE_SERVICE_ROLE_KEY`、`JWT_SECRET`、RPC key 或任何私密資訊只能放在後端環境，不可放到前端。

## API

### Health

- `GET /health`

### Auth

- `POST /auth/nonce`
- `POST /auth/login`

登入流程會產生 nonce，讓玩家用 MetaMask 簽名，再由後端用 ethers 驗證簽名與錢包地址，成功後回傳 JWT。

目前前端預設使用 `VITE_FRONTEND_ONLY_AUTH=true`，因此前端測試時會略過這組登入 API。要測試正式後端登入，請將前端設定改成 `VITE_FRONTEND_ONLY_AUTH=false`。

### Player

- `GET /player`

### Expedition

- `POST /start-expedition`
- `POST /claim-reward`

### Market

- `GET /resources`
- `GET /market/listings`
- `POST /market/listings`
- `POST /market/cancel-listing`
- `POST /market/buy-listing`
- `GET /transactions`

### Social

- `POST /add-friend`
- `GET /friends`

## Supabase

Schema 位於：

```text
backend/supabase/schema.sql
```

目前包含：

- `users`
- `auth_nonces`
- `pets`
- `pet_teams`
- `currencies`
- `inventory`
- `market_listings`
- `transactions`
- `expeditions`
- `friends`
- `friend_requests`

Schema 內已包含部分 RLS policy、index、updated_at trigger 與基本關聯設計。

開發或測試資料清理腳本：

```text
backend/supabase/clear_game_data.sql
```

此腳本用於清空遊戲資料，預設不清空 `users` 與 `auth_nonces`，避免登入身份資料被誤刪。正式使用前請先確認要清除的表。

## 目前資料策略

`playerService.initializePlayerIfNeeded` 目前只保留為同步入口，不會再自動產生寵物、材料或金幣。

未來正式上鏈後，預期流程是：

- 從 ERC-721 讀取玩家擁有的水豚寵物。
- 從 ERC-1155 讀取玩家擁有的材料或消耗品。
- 從 tokenURI 或 metadata service 取得寵物資料。
- 從合約事件或 indexer 同步市場與交易紀錄。
- 後端資料庫只保存快取、查詢索引、登入身份、排行榜或需要服務端驗證的資料。

## 主要目錄

```text
src/
├─ app.ts              Express app 設定
├─ index.ts            Server entry
├─ config/             env 與 Supabase client
├─ controllers/        HTTP controller
├─ middleware/         auth 與 error handler
├─ routes/             API routes
├─ services/           商業邏輯與資料存取
└─ utils/              async handler 與 HTTP error
```

共用遊戲內容放在根目錄 `game-content/`。後端透過 `@cryptopets/game-content` 讀取材料 ID、素材定義與未來可用的劇本規則，避免前後端各自維護一份內容。

## 後續重點

- 補上完整 API 測試。
- 統一 API response 格式。
- 將市場與遠征流程改成可驗證鏈上資產。
- 加入合約事件同步或 indexer。
- 強化 RLS policy、rate limit、錯誤紀錄與部署監控。
