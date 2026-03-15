# 変更履歴

---

## 2026-03-16 — 手動メンバー管理モードへ変更

### 削除
- LINE WORKS API連携（メンバー同期ボタン・通知ボタン）
- Vercel Functions経由のAPI中継ロジック（`/api/form-responses`, `/api/notify`, `/api/token`）
- 設定画面のアンケートID (`formId`)・通知チャンネルID (`channelId`)
- `AppSettings` 型から `formId`・`channelId` フィールド

### 追加
- `src/components/MemberListPanel.tsx` — メンバーの手動追加・削除・参加切り替えUI
  - 名前 + 部署（任意）を入力して追加（Enter対応）
  - 丸ボタンで「参加 / 不参加」トグル
  - × ボタンで削除
  - 参加人数カウント表示

### 変更
- `src/types.ts` — `Member` に `attending: boolean` フィールドを追加
- `src/lib/storage.ts` — `getSettings()` のデフォルト値から `formId`・`channelId` を削除
- `src/components/SettingsPanel.tsx` — API関連の設定項目を削除（グループ目標人数のみ残す）
- `src/App.tsx`
  - 「メンバー同期」ボタン → `MemberListPanel` に置き換え
  - 「LINE WORKS通知」ボタンを削除
  - シャッフル対象を `attending: true` のメンバーのみに限定
  - メンバー変更時にグループをリセット

---

## 2026-03-16 — 初回実装

### 追加（フルスクラッチ構築）

**フロントエンド**
- `src/types.ts` — `Member`, `Group`, `PairHistory`, `AppSettings` 型定義
- `src/lib/utils.ts` — `cn()` ユーティリティ（Tailwind class merge）
- `src/lib/storage.ts` — LocalStorage管理（メンバー・履歴・設定・ペアカウント）
- `src/lib/shuffle.ts` — スマートシャッフルアルゴリズム（200試行、過去ペア回避・同部署回避）
- `src/components/ui/button.tsx` — Buttonコンポーネント（shadcn/ui）
- `src/components/ui/card.tsx` — Card系コンポーネント（shadcn/ui）
- `src/components/ui/badge.tsx` — Badgeコンポーネント（shadcn/ui）
- `src/components/GroupCard.tsx` — ドラッグ&ドロップ対応グループカード
- `src/components/SettingsPanel.tsx` — 設定画面（formId・グループ人数・channelId）
- `src/App.tsx` — メインUI（同期・シャッフル・コピー・通知・D&D）

**バックエンド（Vercel Functions）**
- `api/token.ts` — LINE WORKS OAuth2 JWTフロー → アクセストークン取得
- `api/form-responses.ts` — アンケート回答取得・「参加」回答者フィルタリング
- `api/notify.ts` — LINE WORKS Botチャンネルへの通知送信

**設定・インフラ**
- `vercel.json` — APIリライト設定
- `.env.example` — 必要な環境変数一覧（`LW_CLIENT_ID` 等8変数）
- `vite.config.ts` — `/api` を `localhost:3000` へプロキシ
- `tailwind.config.js` / `postcss.config.js` — Tailwind CSS v4設定
- `.github/workflows/notify.yml` — 毎週金曜10時JST Bot通知 GitHub Actions
