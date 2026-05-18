# CryptoPets TODO

本文件只記錄後續需要實作或可以優化的事項；已完成內容請看 `README.md`、`frontend/README.md`、`backend/README.md`。

## 前端

- 將 `StoreView` 的上架商品、近期交易、材料庫存改接 API 或鏈上資料提供器。
- 將更多前端硬編碼文字與版型用資料搬進 `game-content`，只保留 UI 呈現邏輯。
- 補齊市場上架、取消上架、購買商品的完整前端互動流程。
- 為鏈上資料同步加入 loading、error、retry、empty 狀態。
- 加入 MetaMask 錯誤處理，例如拒絕連線、沒有安裝、切錯帳號、切錯網路。
- 加入指定 chain id 的偵測與切換網路提示。
- 將測試贈送四隻水豚流程抽成可關閉的 dev/test feature flag。
- 正式模式下，根據鏈上或後端紀錄判斷玩家是否已領取過初始水豚。
- 將遠征開始與領取獎勵流程改成可串接後端驗證或鏈上交易。
- 補齊寵物升級、技能升級、進階材料不足時的提示狀態。
- 整理目前硬編碼文字，規劃 i18n 或統一文字管理。
- 檢查桌機與手機版 UI，修正市場、資料站、遠征紀錄與彈窗的響應式版型。
- 補上前端端到端測試，至少涵蓋登入、領取初始水豚、遠征、寵物升級、市場彈窗。

## 後端 API

- 統一 API response 格式，例如 `{ success, data, error }`。
- 補齊 zod schema，驗證 request body、params、query。
- 補齊 API integration tests。
- 為 auth、market、expedition、friend service 加入單元測試。
- 加入 rate limit，避免登入 nonce、交易、遠征 claim 被濫用。
- 加入更完整的錯誤紀錄與 request id，方便追蹤前後端問題。
- 將玩家資產讀取流程改成鏈上 ownership 驗證或 indexer 查詢。
- 將遠征獎勵 claim 改成可防止重複領取與竄改的流程。
- 決定後端是否需要 relayer 或交易佇列。

## 資料庫與 Supabase

- 檢查並補齊 RLS policy，區分玩家可讀資料與後端 service role 寫入資料。
- 調整資料庫定位，讓 Supabase 成為鏈上資料的快取、索引與輔助狀態。
- 建立正式 migration 流程，避免直接手動改 schema。
- 建立 seed 或 fixture 腳本，只用於 dev/test，不混入正式資料。
- 規劃鏈上事件同步表，例如 contract events、sync cursors、token metadata cache。
- 規劃資料清理與重建流程，方便從鏈上狀態重新建立快取。

## 上鏈整合

- 設計並實作 ERC-721 水豚寵物合約。
- 設計並實作 ERC-1155 材料或消耗品合約。
- 規劃初始四隻水豚的 mint 或 claim 流程。
- 規劃 tokenURI 與 metadata 儲存方式，例如 IPFS、Arweave 或後端 metadata service。
- 實作前端 `ChainDataProvider`，取代目前的空資料 provider。
- 實作玩家 NFT/SFT ownership 查詢。
- 實作鏈上交易狀態追蹤，例如 pending、confirmed、failed。
- 規劃市場交易模式：純鏈上交易、後端撮合加鏈上結算，或混合模式。
- 規劃寵物等級、經驗、技能點數哪些資料必須上鏈，哪些資料可由後端索引或遊戲規則推導。
- 補上測試網部署設定、RPC、chain id、contract address 與驗證流程。

## 遊戲內容

- 補齊 `game-content` 的內容規格文件，說明寵物、材料、劇本、事件條件與 asset 路徑格式。
- 補齊更多森林關卡、事件、獎勵與難度平衡。
- 設計不同屬性水豚對遠征成功率、事件結果與獎勵的影響。
- 補齊材料種類、稀有度、掉落規則與用途。
- 補齊寵物進階條件、進階後外觀或能力變化。
- 補齊技能樹與技能效果。
- 規劃好友、支援隊伍、交易或合作玩法。
- 規劃市場評價、交易紀錄與防詐騙提示。

## 測試與品質

- 建立 CI，至少執行 build、type-check、API tests。
- 加入 Playwright 或等效工具，做主要流程截圖與互動測試。
- 加入合約測試，涵蓋 mint、transfer、claim、market settlement。
- 建立 staging 環境，分離 dev、staging、production env。
- 補齊部署後 smoke test，檢查前端、後端、Supabase、RPC 是否正常。

## 文件與部署

- 補完整 API 文件，包含 request、response、錯誤格式與驗證規則。
- 補上合約文件，包含合約地址、ABI、事件、權限與部署流程。
- 補上前端正式模式與測試模式切換說明。
- 補上 Vercel 前端部署設定。
- 補上 Render 後端部署設定。
- 補上 Supabase staging/production 建置與 migration 操作說明。
