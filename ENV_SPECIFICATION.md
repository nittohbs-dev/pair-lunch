# Pair Lunch - ランタイム環境変数仕様書

## 📋 概要

Pair Lunch は、Pylon からランタイムで環境変数を受け取り、フロントエンド側で動的に Supabase や外部サービスに接続できるように設計されています。

ビルド時に環境変数を埋め込むのではなく、**実行時に HTML 内に環境変数を注入**することで、同じイメージを複数の環境で再利用可能です。

## 🔄 動作フロー

```
┌─────────────────────────────────────────────────────────────┐
│ Pylon (Docker Host)                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 環境変数を設定                                           │
│     VITE_SUPABASE_URL=https://xxx.supabase.co              │
│     VITE_SUPABASE_ANON_KEY=sb_xxx                          │
│                                                             │
│  2. Pair Lunch コンテナを起動                               │
│     docker run -e VITE_SUPABASE_URL=... pair-lunch:latest  │
│                                                             │
│  3. Nginx が index.html を配信                            │
│     ↓                                                      │
└────────────┬──────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│ Browser (Pair Lunch Frontend)                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  4. index.html を読み込む                                  │
│     <script>                                               │
│       window.__env__ = {                                   │
│         VITE_SUPABASE_URL: 'https://xxx.supabase.co',     │
│         VITE_SUPABASE_ANON_KEY: 'sb_xxx'                  │
│       }                                                    │
│     </script>                                              │
│                                                             │
│  5. React アプリが起動                                     │
│     ↓                                                      │
│                                                             │
│  6. supabase.ts が初期化                                  │
│     const url = window.__env__.VITE_SUPABASE_URL           │
│     const key = window.__env__.VITE_SUPABASE_ANON_KEY     │
│                                                             │
│  7. Supabase に接続                                       │
│     ↓ (API 呼び出し)                                      │
└────────────┬──────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│ Supabase (外部 API)                                         │
└─────────────────────────────────────────────────────────────┘
```

## 📝 環境変数仕様

### 必須変数

#### 1. `VITE_SUPABASE_URL`
- **説明**: Supabase プロジェクトの URL
- **型**: `string (URL)`
- **例**: `https://qmcnzfablczxxpdlyvhy.supabase.co`
- **必須**: ✅ はい
- **用途**: データベース接続
- **設定場所**: Pylon Docker 環境変数

```bash
docker run -e VITE_SUPABASE_URL=https://your-project.supabase.co ...
```

#### 2. `VITE_SUPABASE_ANON_KEY`
- **説明**: Supabase 匿名キー（公開キー）
- **型**: `string (JWT)`
- **例**: `sb_publishable_J01EzipTdPvs7QVD-ZUbGQ_rc9NCrcQ`
- **必須**: ✅ はい
- **用途**: Supabase クライアント認証
- **設定場所**: Pylon Docker 環境変数
- **セキュリティ**: 公開キーなので、フロントエンドに埋め込み可能

```bash
docker run -e VITE_SUPABASE_ANON_KEY=sb_publishable_... ...
```

### オプション変数（LINE WORKS）

#### 3. `LW_CLIENT_ID`
- **説明**: LINE WORKS クライアント ID
- **型**: `string`
- **例**: `123456789`
- **必須**: ❌ いいえ
- **用途**: LINE WORKS 認証
- **デフォルト**: 空文字列（`""`)

```bash
docker run -e LW_CLIENT_ID=123456789 ...
```

#### 4. `LW_CLIENT_SECRET`
- **説明**: LINE WORKS クライアントシークレット
- **型**: `string`
- **例**: `abc123def456`
- **必須**: ❌ いいえ（LW_CLIENT_ID が設定されている場合は推奨）
- **用途**: LINE WORKS 認証
- **デフォルト**: 空文字列（`""`)
- **セキュリティ**: シークレットキーの管理に注意

```bash
docker run -e LW_CLIENT_SECRET=abc123def456 ...
```

#### 5. `LW_SERVICE_ACCOUNT`
- **説明**: LINE WORKS サービスアカウント設定（JSON）
- **型**: `string (JSON)`
- **例**: `{"serviceAccountId":"xxxx","serviceAccountPassword":"xxxx"}`
- **必須**: ❌ いいえ
- **用途**: LINE WORKS サービスアカウント認証
- **デフォルト**: 空文字列（`""`)

```bash
docker run -e LW_SERVICE_ACCOUNT='{"serviceAccountId":"xxxx"}' ...
```

#### 6. `LW_PRIVATE_KEY`
- **説明**: LINE WORKS プライベートキー
- **型**: `string (PEM)`
- **例**: `-----BEGIN PRIVATE KEY-----\n...`
- **必須**: ❌ いいえ
- **用途**: LINE WORKS JWT 署名
- **デフォルト**: 空文字列（`""`)

```bash
docker run -e LW_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..." ...
```

#### 7. `LW_BOT_ID`
- **説明**: LINE WORKS Bot ID
- **型**: `string`
- **例**: `1234567890`
- **必須**: ❌ いいえ
- **用途**: LINE WORKS Bot 操作
- **デフォルト**: 空文字列（`""`)

```bash
docker run -e LW_BOT_ID=1234567890 ...
```

#### 8. `LW_CHANNEL_ID`
- **説明**: LINE WORKS チャネル ID
- **型**: `string`
- **例**: `1234567890`
- **必須**: ❌ いいえ
- **用途**: LINE WORKS チャネル操作
- **デフォルト**: 空文字列（`""`)

```bash
docker run -e LW_CHANNEL_ID=1234567890 ...
```

#### 9. `LW_FORM_ID`
- **説明**: LINE WORKS フォーム ID
- **型**: `string`
- **例**: `1234567890`
- **必須**: ❌ いいえ
- **用途**: LINE WORKS フォーム連携
- **デフォルト**: 空文字列（`""`)

```bash
docker run -e LW_FORM_ID=1234567890 ...
```

#### 10. `LW_DOMAIN_ID`
- **説明**: LINE WORKS ドメイン ID
- **型**: `string`
- **例**: `1234567890`
- **必須**: ❌ いいえ
- **用途**: LINE WORKS ドメイン操作
- **デフォルト**: 空文字列（`""`)

```bash
docker run -e LW_DOMAIN_ID=1234567890 ...
```

## 🚀 実装方法

### パターン 1: Docker Compose（推奨）

Pylon の `docker-compose.yml` で設定：

```yaml
services:
  pair-lunch:
    image: pair-lunch:latest
    ports:
      - "3000:3000"
    environment:
      # 必須
      - VITE_SUPABASE_URL=https://qmcnzfablczxxpdlyvhy.supabase.co
      - VITE_SUPABASE_ANON_KEY=sb_publishable_J01EzipTdPvs7QVD-ZUbGQ_rc9NCrcQ
      
      # オプション（LINE WORKS）
      - LW_CLIENT_ID=
      - LW_CLIENT_SECRET=
      - LW_SERVICE_ACCOUNT=
      - LW_PRIVATE_KEY=
      - LW_BOT_ID=
      - LW_CHANNEL_ID=
      - LW_FORM_ID=
      - LW_DOMAIN_ID=
    restart: unless-stopped
```

### パターン 2: Docker Run コマンド

**重要**: `--entrypoint` に docker-entrypoint.sh を指定してください

```bash
docker run -d \
  --name pair-lunch \
  -p 3000:3000 \
  -e VITE_SUPABASE_URL=https://qmcnzfablczxxpdlyvhy.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=sb_publishable_J01EzipTdPvs7QVD-ZUbGQ_rc9NCrcQ \
  -e LW_CLIENT_ID= \
  --entrypoint /app/docker-entrypoint.sh \
  pair-lunch:latest
```

### パターン 3: .env ファイル

Pylon で `.env` ファイルを作成：

```env
# Supabase
VITE_SUPABASE_URL=https://qmcnzfablczxxpdlyvhy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_J01EzipTdPvs7QVD-ZUbGQ_rc9NCrcQ

# LINE WORKS (optional)
LW_CLIENT_ID=
LW_CLIENT_SECRET=
LW_SERVICE_ACCOUNT=
LW_PRIVATE_KEY=
LW_BOT_ID=
LW_CHANNEL_ID=
LW_FORM_ID=
LW_DOMAIN_ID=
```

Docker Compose で読み込み：

```yaml
services:
  pair-lunch:
    image: pair-lunch:latest
    env_file:
      - .env
```

## 🔧 内部実装詳細

### index.html での環境変数注入

```html
<!-- Environment variables injected at runtime -->
<script>
  window.__env__ = {
    VITE_SUPABASE_URL: '${VITE_SUPABASE_URL}',
    VITE_SUPABASE_ANON_KEY: '${VITE_SUPABASE_ANON_KEY}',
    LW_CLIENT_ID: '${LW_CLIENT_ID}',
    LW_CLIENT_SECRET: '${LW_CLIENT_SECRET}',
    LW_SERVICE_ACCOUNT: '${LW_SERVICE_ACCOUNT}',
    LW_PRIVATE_KEY: '${LW_PRIVATE_KEY}',
    LW_BOT_ID: '${LW_BOT_ID}',
    LW_CHANNEL_ID: '${LW_CHANNEL_ID}',
    LW_FORM_ID: '${LW_FORM_ID}',
    LW_DOMAIN_ID: '${LW_DOMAIN_ID}'
  };
</script>
```

### pair-lunch の docker-entrypoint.sh

**pair-lunch** 側で `docker-entrypoint.sh` を用意しており、これが起動時に以下の処理を実行します：

```bash
#!/bin/sh
set -e

INDEX_FILE="/usr/share/nginx/html/index.html"

echo "🔄 Injecting environment variables into index.html..."

# sed で環境変数テンプレート ${VAR_NAME} を実際の値に置換
sed -i \
  "s|\${VITE_SUPABASE_URL}|${VITE_SUPABASE_URL:-}|g" \
  "s|\${VITE_SUPABASE_ANON_KEY}|${VITE_SUPABASE_ANON_KEY:-}|g" \
  "s|\${LW_CLIENT_ID}|${LW_CLIENT_ID:-}|g" \
  "s|\${LW_CLIENT_SECRET}|${LW_CLIENT_SECRET:-}|g" \
  "s|\${LW_SERVICE_ACCOUNT}|${LW_SERVICE_ACCOUNT:-}|g" \
  "s|\${LW_PRIVATE_KEY}|${LW_PRIVATE_KEY:-}|g" \
  "s|\${LW_BOT_ID}|${LW_BOT_ID:-}|g" \
  "s|\${LW_CHANNEL_ID}|${LW_CHANNEL_ID:-}|g" \
  "s|\${LW_FORM_ID}|${LW_FORM_ID:-}|g" \
  "s|\${LW_DOMAIN_ID}|${LW_DOMAIN_ID:-}|g" \
  "$INDEX_FILE"

# Nginx を起動
exec nginx -g "daemon off;"
```

### Pylon側での実行方法

Pylon の Dockerfile で `docker-entrypoint.sh` を ENTRYPOINT として指定：

```dockerfile
# Pylon の Dockerfile
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
```

または Docker Compose で：

```yaml
services:
  pair-lunch:
    image: pair-lunch:latest
    entrypoint: /app/docker-entrypoint.sh
    environment:
      - VITE_SUPABASE_URL=https://your-project.supabase.co
      - VITE_SUPABASE_ANON_KEY=sb_publishable_xxx
```

### supabase.ts での環境変数読み込み

```typescript
// ランタイム環境変数（HTML注入）とビルド時環境変数の両方に対応
// @ts-ignore
const supabaseUrl = window.__env__?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
// @ts-ignore
const supabaseAnonKey = window.__env__?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// フォールバック：どちらも設定されていない場合はエラー
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("環境変数が読み込めていません。 .envファイルと再起動を確認してください。")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## ✅ 検証チェックリスト

Pylon 側で設定する際の確認項目：

- [ ] **docker-entrypoint.sh が実行されているか**
  - [ ] コンテナログに「🔄 Injecting environment variables into index.html...」が表示されているか
  - [ ] ログに「✅ Environment variables injected successfully」が表示されているか

- [ ] **必須変数が設定されているか**
  - [ ] `VITE_SUPABASE_URL` が有効な URL か
  - [ ] `VITE_SUPABASE_ANON_KEY` が有効なキーか

- [ ] **環境変数が正しく渡されているか**
  - [ ] `docker run -e` または `docker-compose` で正しく設定されているか
  - [ ] 値に空白がないか
  - [ ] 特殊文字がエスケープされているか

- [ ] **index.html が正しく埋め込まれているか**
  - [ ] HTML に `${VITE_SUPABASE_URL}` などの未置換テンプレートが**残っていない**か
  - [ ] ブラウザ開発者ツール → ネットワーク → index.html を確認
  - [ ] `window.__env__ = { VITE_SUPABASE_URL: 'https://xxx.supabase.co', ... }` のように値が埋め込まれているか

- [ ] **フロントエンドで環境変数が読み込まれているか**
  - [ ] ブラウザコンソール（F12）で `console.log(window.__env__)` を実行
  - [ ] 実際の値が表示されるか（`${...}` ではなく）
  - [ ] Supabase に正常に接続できているか

## 🐛 トラブルシューティング

### 問題: HTML に `${VITE_SUPABASE_URL}` がそのまま残っている

**原因**: `docker-entrypoint.sh` が実行されていない、またはエントリーポイントが設定されていない

**解決方法**:

1. **コンテナログを確認**
```bash
docker logs pair-lunch-app
# 以下のログが表示されているか確認：
# 🔄 Injecting environment variables into index.html...
# ✅ Environment variables injected successfully
```

2. **Pylon の Dockerfile で ENTRYPOINT を確認**
```dockerfile
# ✅ 正しい
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# ❌ 間違い（entrypoint が設定されていない）
# ENTRYPOINT 行がない場合
```

3. **Pylon の docker-compose.yml で entrypoint を確認**
```yaml
# ✅ 正しい
services:
  pair-lunch:
    entrypoint: /app/docker-entrypoint.sh
    
# ❌ 間違い
services:
  pair-lunch:
    # entrypoint が設定されていない
```

4. **HTML 内の値を確認**
```bash
docker exec pair-lunch-app grep -A 5 "window.__env__" /usr/share/nginx/html/index.html

# ✅ 正しい：
# VITE_SUPABASE_URL: 'https://qmcnzfablczxxpdlyvhy.supabase.co',

# ❌ 間違い：
# VITE_SUPABASE_URL: '${VITE_SUPABASE_URL}',
```

### エラー: "supabaseUrl is required"

**原因**: `VITE_SUPABASE_URL` が設定されていないか、HTML に注入されていない

**解決方法**:
```bash
# 1. 環境変数が設定されているか確認
docker exec pair-lunch-app env | grep VITE_SUPABASE

# 2. index.html に環境変数が注入されているか確認
docker exec pair-lunch-app cat /usr/share/nginx/html/index.html | grep VITE_SUPABASE_URL

# 3. docker-entrypoint.sh が実行されているか確認
docker logs pair-lunch-app | grep "Injecting environment"
```

### エラー: "環境変数が読み込めていません"

**原因**: `window.__env__` が undefined

**解決方法**:
```javascript
// ブラウザコンソールで確認
console.log(window.__env__)  // undefined の場合は注入に失敗
console.log(import.meta.env.VITE_SUPABASE_URL)  // ビルド時の値
```

### Supabase に接続できない

**原因**: URL やキーが間違っている、または Supabase プロジェクトが削除されている

**解決方法**:
```bash
# 値を確認
docker exec pair-lunch-app cat /usr/share/nginx/html/index.html | grep -A 20 "window.__env__"

# 正しい値を再設定して再起動
docker stop pair-lunch-app
docker run -d \
  -e VITE_SUPABASE_URL=https://correct-url.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=correct-key \
  pair-lunch:latest
```

## 📊 環境変数一覧テーブル

| 変数名 | 型 | 必須 | 説明 | 例 |
|--------|-----|------|------|-----|
| `VITE_SUPABASE_URL` | string (URL) | ✅ | Supabase URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | string (JWT) | ✅ | Supabase キー | `sb_publishable_...` |
| `LW_CLIENT_ID` | string | ❌ | LINE WORKS クライアント ID | `123456789` |
| `LW_CLIENT_SECRET` | string | ❌ | LINE WORKS シークレット | `abc123def456` |
| `LW_SERVICE_ACCOUNT` | string (JSON) | ❌ | LINE WORKS サービスアカウント | `{"serviceAccountId":"xxxx"}` |
| `LW_PRIVATE_KEY` | string (PEM) | ❌ | LINE WORKS プライベートキー | `-----BEGIN PRIVATE KEY-----...` |
| `LW_BOT_ID` | string | ❌ | LINE WORKS Bot ID | `1234567890` |
| `LW_CHANNEL_ID` | string | ❌ | LINE WORKS チャネル ID | `1234567890` |
| `LW_FORM_ID` | string | ❌ | LINE WORKS フォーム ID | `1234567890` |
| `LW_DOMAIN_ID` | string | ❌ | LINE WORKS ドメイン ID | `1234567890` |

## 🔐 セキュリティに関する注意

1. **公開キーと秘密キーの区別**
   - `VITE_SUPABASE_ANON_KEY` は公開キー → HTML に埋め込み可能
   - `VITE_SUPABASE_ANON_KEY` ではなく `SUPABASE_SERVICE_ROLE_KEY` は秘密キー → サーバー側のみで使用

2. **LINE WORKS の秘密情報**
   - `LW_CLIENT_SECRET`, `LW_PRIVATE_KEY` は秘密情報
   - Pylon の環境変数として管理（フロントエンドに埋め込まない）
   - 必要に応じて API ゲートウェイを使用

3. **ログに秘密情報を出力しない**
   ```javascript
   // ❌ してはいけない
   console.log(window.__env__.VITE_SUPABASE_ANON_KEY)
   
   // ✅ 必要に応じてマスク
   console.log("Supabase URL:", window.__env__.VITE_SUPABASE_URL)
   ```

## 📞 サポート

問題が発生した場合：

1. ログを確認
   ```bash
   docker logs pair-lunch-app
   ```

2. ブラウザコンソール（F12）でエラーを確認

3. 本ドキュメントの「トラブルシューティング」を参照

4. このドキュメントと診断結果を共有
