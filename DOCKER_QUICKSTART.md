# Docker クイックスタートガイド

## 📦 セットアップが完了しました！

以下のファイルが作成されています：

### ファイル構成
```
├── Dockerfile              # 開発用イメージ定義
├── Dockerfile.prod         # 本番用イメージ定義（Nginx使用）
├── docker-compose.yml      # 開発環境
├── docker-compose.prod.yml # 本番環境
├── .dockerignore          # Dockerビルドから除外するファイル
├── Makefile               # 便利なコマンド集
├── DOCKER.md              # 詳細ドキュメント
└── .env.production        # 本番環境変数テンプレート
```

## 🚀 クイックスタート（3ステップ）

### 1️⃣ イメージをビルド
```bash
make docker-build
```
または
```bash
docker-compose build
```

### 2️⃣ コンテナを起動
```bash
make docker-up
```
または
```bash
docker-compose up -d
```

### 3️⃣ アプリケーションにアクセス
ブラウザで http://localhost:3000 を開く

---

## 🔧 よく使うコマンド

### 開発環境
| コマンド | 説明 |
|---------|------|
| `make docker-build` | イメージをビルド |
| `make docker-up` | コンテナを起動 |
| `make docker-down` | コンテナを停止 |
| `make docker-logs` | ログを表示 |
| `make docker-shell` | コンテナにシェル接続 |
| `make docker-clean` | イメージとコンテナをクリーン |

### 本番環境
| コマンド | 説明 |
|---------|------|
| `make docker-prod-build` | 本番用イメージをビルド（Nginx） |
| `make docker-prod-up` | 本番用コンテナを起動 |
| `make docker-prod-down` | 本番用コンテナを停止 |

### テスト
```bash
make docker-test  # イメージの動作確認
```

---

## 📝 環境変数の設定

`.env` ファイルで環境変数を設定してください：

```env
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

---

## 🏗️ 本番環境へのデプロイ

### オプション 1: Docker Compose使用
```bash
# 本番環境をビルド＆起動
make docker-prod-up

# または
docker-compose -f docker-compose.prod.yml up -d
```

### オプション 2: Dockerコマンド使用
```bash
# イメージをビルド
docker build -t pair-lunch:v1.0.0 -f Dockerfile.prod .

# コンテナを起動（本番環境推奨設定）
docker run -d \
  --name pair-lunch-prod \
  -p 3000:3000 \
  --restart=always \
  --env-file .env.production \
  pair-lunch:v1.0.0
```

---

## 🔍 トラブルシューティング

### ポートが既に使用されている
```bash
# 別のポートで実行
docker run -p 8080:3000 pair-lunch:latest
```

### キャッシュなしで再ビルド
```bash
make docker-build  # キャッシュクリアはMakefileで自動処理
# または
docker build --no-cache -t pair-lunch:latest .
```

### ログを確認
```bash
make docker-logs
# または
docker-compose logs -f app
```

### コンテナに接続
```bash
make docker-shell
# または
docker exec -it pair-lunch-app sh
```

---

## 📚 詳細情報

より詳しい情報は `DOCKER.md` を参照してください。

---

## 🐳 Docker イメージのサイズ

### 開発用（http-server使用）
- ベース: node:22-alpine
- 最終サイズ: 約 300-400 MB

### 本番用（Nginx使用）
- ベース: nginx:1.27-alpine
- 最終サイズ: 約 200-300 MB（軽量）

---

## 💡 推奨される構成

| 用途 | Dockerfile | docker-compose |
|------|-----------|----------------|
| 開発 | `Dockerfile` | `docker-compose.yml` |
| 本番 | `Dockerfile.prod` | `docker-compose.prod.yml` |
| テスト | 両方 | N/A |

---

## ✅ 確認事項

Docker セットアップ後、以下が正しく機能していることを確認してください：

- [ ] `make docker-test` でテストが成功
- [ ] `http://localhost:3000` にアクセスできる
- [ ] フロントエンドが表示される
- [ ] コンテナログにエラーがない

---

## 📞 サポート

問題が発生した場合：

1. `make docker-logs` でログを確認
2. `DOCKER.md` のトラブルシューティングを参照
3. Dockerfile と環境変数の設定を確認

---

**Happy Dockering! 🚀**
