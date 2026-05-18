# CryptoPets Frontend

CryptoPets 前端是 Vue 3 + Vite + TypeScript 製作的水豚養成遊戲介面。現在以測試模式優先完成遊戲 UI、MetaMask 登入、遠征、寵物資料站與市場版型；未來會把目前的本地測試資料改成鏈上資料。

## 開發資訊

- Dev server: `http://localhost:5400`
- API base: `http://localhost:3400`
- Framework: Vue 3
- Build tool: Vite
- Language: TypeScript

## 啟動方式

在專案根目錄執行：

```bash
npm run dev:frontend
```

或在 `frontend/` 目錄執行：

```bash
npm run dev
```

建置：

```bash
npm run build
```

型別檢查：

```bash
npm run type-check
```

## 環境變數

請由 `frontend/.env.example` 建立 `frontend/.env`。

```text
VITE_API_BASE_URL=http://localhost:3400
VITE_FRONTEND_ONLY_AUTH=true
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_CHAIN_ID=1
VITE_NFT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

### 測試登入模式

目前預設：

```text
VITE_FRONTEND_ONLY_AUTH=true
```

此模式只透過 MetaMask 取得錢包地址，不會呼叫後端 `/auth/nonce` 與 `/auth/login`。這是為了先測試前端流程，避免尚未完成的後端或鏈上服務阻擋 UI 測試。

若要測試後端簽名登入，改成：

```text
VITE_FRONTEND_ONLY_AUTH=false
```

## 目前頁面與流程

- 登入入口：啟動後自動開啟 MetaMask 連接錢包。
- 登入確認畫面：顯示唯讀錢包地址 input 與確認按鈕，取得地址前不可確認。
- 測試贈送彈窗：每次登入都視為新用戶，贈送四隻初始水豚。
- 首頁遠征：選擇森林、開始探索、顯示遠征狀態與事件紀錄。
- 寵物資料站：顯示隊伍、寵物列表、寵物資料、技能升級與進階材料。
- 市場：顯示上架商品格、近期交易、市場評價與材料上架彈窗。

## 測試資料

測試階段的四隻水豚由 `frontend/src/data/pets.ts` 建立：

- Capy-san：`TEST-PET-001`
- Yuzu-boy：`TEST-PET-002`
- Koko：`TEST-PET-003`
- Bobo：`TEST-PET-004`

目前規則：

- 初始等級為 0。
- 初始經驗值為 0。
- 技能等級初始值為 1。
- 技能點數初始值為 0。
- 遠征完成後會用本地測試狀態增加寵物經驗與等級。
- 每升 1 等才會增加 1 點技能點數。
- 每次重啟或重新登入會回到測試初始狀態。

正式上鏈後，寵物等級、經驗、材料、是否領過初始水豚，都應該改由鏈上資料或鏈上索引結果判斷。

## 鏈上資料入口

鏈上資料抽象放在：

```text
frontend/src/web3/chainData.ts
```

目前的 `localEmptyChainDataProvider` 會回傳空寵物與空材料。未來要在這裡改接：

- RPC 或合約讀取。
- NFT/SFT ownership 查詢。
- token metadata 解析。
- indexer 或後端同步 API。

## 主要目錄

```text
src/
├─ api/          REST API client
├─ assets/       圖片、音樂與遊戲素材
├─ content/      將 game-content 圖片轉成前端可用 asset mapping
├─ composables/  MetaMask 與登入狀態
├─ data/         測試用寵物與材料資料
├─ router/       Vue Router
├─ state/        前端測試狀態
├─ views/        Home、Pets、Store 頁面
└─ web3/         鏈上資料抽象
```

共用遊戲內容放在根目錄 `game-content/`，前端透過 `@cryptopets/game-content` 讀水豚、材料與劇本資料，並透過 `@game-content/assets/...` 載入圖片。

## 注意事項

- 前端不應放入 Supabase service role key、私鑰或任何後端 secret。
- `VITE_` 開頭的變數會被打包到瀏覽器端。
- 目前前端是測試狀態，資料不代表正式鏈上狀態。
- 未來接上正式鏈上資料後，應移除或隔離測試贈送流程。
