# CryptoPets

CryptoPets 是一個以「水豚寵物養成、遠征、材料、市場」為核心的 Web3 遊戲專案。專案最終目標是以上鏈資料作為真實狀態來源，目前仍在前端與 API 串接測試階段，因此先使用本地陣列與測試資料完成遊戲流程。

目前版本保留上鏈架構與資料同步入口，但尚未實作正式合約讀寫。前端登入後會先從鏈上資料提供器讀取玩家資產；現在的提供器會回傳空陣列，測試階段再由前端贈送四隻初始水豚來驗證流程。

## 專案結構

```text
/
├─ frontend/      Vue 3 + Vite + TypeScript 前端遊戲介面
├─ backend/       Express + TypeScript 後端 API
├─ game-content/  遊戲素材、寵物/材料格式、森林劇本與劇情內容
├─ shared/        前後端共用 TypeScript 型別
├─ DEV_PORTS.md   本地開發阜號說明
├─ TODO.md        後續待實作事項
└─ TODO_ONCHAIN.md 上鏈方向待辦
```

## 本地阜號

- Frontend: `http://localhost:5400`
- Backend: `http://localhost:3400`

前端 Vite 已固定使用 `5400`，後端預設使用 `3400`。相關設定可參考 `DEV_PORTS.md`、`frontend/.env.example`、`backend/.env.example`。

## 快速開始

```bash
npm install
```

建立環境變數：

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

啟動後端：

```bash
npm run dev:backend
```

啟動前端：

```bash
npm run dev:frontend
```

建置全部 workspace：

```bash
npm run build
```

型別檢查：

```bash
npm run type-check
```

## 目前完成內容

### 前端

- 使用 Vue 3、Vite、TypeScript 建立遊戲介面。
- 預設啟用前端測試登入模式：`VITE_FRONTEND_ONLY_AUTH=true`。
- 首頁進入時會呼叫 MetaMask 登入，登入畫面只顯示背景、唯讀錢包地址 input 與確認按鈕。
- 確認按鈕會在取得錢包地址後才可點擊。
- 測試階段每次登入都視為新用戶，顯示贈送四隻初始水豚的彈跳視窗。
- 贈送彈窗已顯示四隻水豚圖片：Capy-san、Yuzu-boy、Koko、Bobo。
- 初始水豚等級為 0，經驗值從 0 開始。
- 遠征完成後，測試階段會用本地狀態提升參與遠征水豚的等級。
- 技能點數只在寵物每升 1 等時增加 1 點。
- 技能等級初始值為 1。
- 遠征紀錄已調整為正確順序，目前狀態會顯示選擇的森林開始狀態。
- 寵物資料站、隊伍、升級、市場、材料上架彈窗已有目前測試用 UI。
- 若寵物資料站沒有選擇寵物，會在區塊中央顯示「尚未選擇任一寵物」。
- 市場區塊在沒有商品時保留格子版型，不顯示「尚未上架」類文字。
- 前端保留鏈上資料同步入口：`frontend/src/web3/chainData.ts`。

### 後端

- 使用 Express、TypeScript 建立 API server。
- 後端預設 port 為 `3400`。
- 已建立 wallet nonce、MetaMask 簽名驗證與 JWT 登入流程。
- 已建立玩家、遠征、資源、市場、交易、好友等 API。
- 已建立 Supabase schema，包含 users、auth_nonces、pets、pet_teams、currencies、inventory、market_listings、transactions、expeditions、friends、friend_requests。
- `playerService.initializePlayerIfNeeded` 目前保留為上鏈同步入口，不再自動產生寵物、材料或金幣。
- 提供 `backend/supabase/clear_game_data.sql` 作為開發或測試資料重置腳本。

### Shared

- `shared/src/index.ts` 放置前後端共用型別。
- 已包含錢包、玩家、寵物、遠征、好友、資源、市場與交易相關型別。

### Game Content

- `game-content/src/capybaras.ts` 放置水豚格式、初始四隻水豚資料與圖片 asset 路徑。
- `game-content/src/materials.ts` 放置材料格式、素材定義與素材圖片 frame 路徑。
- `game-content/src/stories.ts` 放置森林劇本、事件條件、隊長屬性與能力值分歧結局。
- `game-content/assets/` 放置水豚與素材圖片，前端用 `@game-content/assets/...` 載入。
- 前端與後端透過 `@cryptopets/game-content` 共用遊戲內容資料。

## 目前資料策略

最終版本會以鏈上資訊作為玩家資產來源：

- ERC-721：寵物 NFT。
- ERC-1155：材料或消耗品 SFT。
- 合約事件或索引器：市場、交易與資產同步。
- 後端資料庫：快取、索引、權限驗證、排行榜、非鏈上輔助資料。

目前測試階段：

- 前端登入只連接 MetaMask 錢包地址。
- `VITE_FRONTEND_ONLY_AUTH=true` 時不會呼叫後端 `/auth/nonce`。
- 鏈上資料提供器暫時回傳空資料。
- 測試用四隻水豚在前端登入確認後贈送。
- 每次重新整理或重新登入都從測試初始狀態開始，方便驗證升級與 UI 流程。

若要測試正式後端簽名登入，將前端 `.env` 改成：

```text
VITE_FRONTEND_ONLY_AUTH=false
```

並確認後端 `.env` 內的 Supabase、JWT、CORS 與 Web3 設定正確。

## API 概覽

- `GET /health`
- `POST /auth/nonce`
- `POST /auth/login`
- `GET /player`
- `GET /resources`
- `POST /start-expedition`
- `POST /claim-reward`
- `GET /market/listings`
- `POST /market/listings`
- `POST /market/cancel-listing`
- `POST /market/buy-listing`
- `GET /transactions`
- `POST /add-friend`
- `GET /friends`

## 部署方向

- Frontend 可部署至 Vercel 或其他靜態站台服務。
- Backend 可部署至 Render 或其他 Node.js server 平台。
- Supabase 用於資料庫與後端服務資料。
- 正式上鏈後，需要補上合約部署、RPC、chain id、contract address、token metadata 與索引器設定。

後續要做的功能請看 `TODO.md`；上鏈相關細節請看 `TODO_ONCHAIN.md`。
