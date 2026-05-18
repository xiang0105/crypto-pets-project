# CryptoPets 上鏈版 TODO

目標：最終以鏈上資料為準。現在允許用本地空陣列與 adapter 開發 UI，但不再預設塞假寵物、假素材、假交易。

## 已完成

- [x] 前端本地寵物資料清空。
- [x] 前端本地素材資料清空。
- [x] 預設遠征隊伍清空。
- [x] 保留 `ChainDataProvider` 介面，未來可替換成合約 / indexer 讀取。
- [x] MetaMask 登入或恢復 session 後會呼叫鏈上資料同步管線。
- [x] 目前鏈上資料 provider 回傳空陣列，頁面以空資料啟動。
- [x] 測試階段每次確認登入都彈窗贈送原先四隻水豚。
- [x] 測試階段贈送水豚會直接寫入本地陣列並設成預設遠征隊伍。
- [x] 測試寵物等級從 0 開始，每次完成遠征本地等級 +1。
- [x] 前端測試模式可只連 MetaMask，不呼叫後端 nonce / login API。

## 必須實作

- [ ] 實作 ERC-721 寵物合約讀取：依 wallet 取得 token ids。
- [ ] 實作 ERC-1155 素材合約讀取：依 wallet 取得 material balances。
- [ ] 實作 tokenURI metadata 讀取與快取。
- [ ] 補錯鏈提示與 chain switching。
- [ ] PetsView 改成完整支援空狀態、同步中、同步失敗。
- [ ] StoreView 改成完整支援空素材、空市場、同步中、同步失敗。
- [ ] HomeView 遠征只能使用鏈上持有的寵物。
- [ ] 後端 mutation 前驗證 NFT/SFT ownership。
- [ ] 決定市場模式：全鏈上、off-chain order + on-chain settlement，或 escrow。
- [ ] 決定探險獎勵 mint / burn / transfer 流程。
- [ ] 移除或隔離所有開發用 localStorage 狀態。
- [ ] 建立測試網部署流程與合約地址設定。
- [ ] 正式上鏈後移除每次登入贈送規則，改用錢包是否曾登入遊戲與鏈上 claim 紀錄判斷。
- [ ] 正式上鏈後四隻新手水豚應由 mint / claim 合約流程發放。
- [ ] 正式上鏈後寵物等級改由鏈上或 indexer 讀取，不使用本地累加。
- [ ] 正式環境將 `VITE_FRONTEND_ONLY_AUTH=false`，恢復後端 nonce、簽章驗證與 JWT session。

## 資料規則

- [ ] 權威資料：寵物持有權、素材餘額、mint、burn、transfer 必須以鏈上為準。
- [ ] 可快取資料：metadata、UI 排序、最後同步時間、非權威活動紀錄。
- [ ] 若 DB 與鏈上資料不一致，以鏈上資料覆蓋 DB cache。
- [ ] 若 RPC / indexer 失敗，顯示錯誤狀態，不產生假資產。
