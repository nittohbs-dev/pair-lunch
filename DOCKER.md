# Docker セットアップガイド

このドキュメントでは、Pair LunchアプリケーションをDockerで実行する方法について説明します。

## 前提条件

- Docker がインストールされていること
- Docker Compose がインストールされていること

## クイックスタート

### 1. 環境変数の設定

`.env` ファイルが存在することを確認してください。必要な環境変数：

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-key>
```

### 2. Dockerイメージのビルド

```bash
docker-compose build
```

### 3. コンテナの起動

```bash
docker-compose up -d
```

アプリケーションは `http://localhost:3000` でアクセス可能になります。

### 4. ログの確認

```bash
docker-compose logs -f
```

### 5. コンテナの停止

```bash
docker-compose down
```

## 手動でのDocker操作

### イメージのビルド

```bash
docker build -t pair-lunch:latest .
```

### コンテナの実行

```bash
docker run -d \
  --name pair-lunch \
  -p 3000:3000 \
  --env-file .env \
  pair-lunch:latest
```

## 本番環境でのデプロイ

### 1. イメージの準備

```bash
docker build -t pair-lunch:v1.0.0 .
```

### 2. イメージの確認

```bash
docker images | grep pair-lunch
```

### 3. コンテナの起動オプション

本番環境では以下のオプションを推奨します：

```bash
docker run -d \
  --name pair-lunch-prod \
  -p 3000:3000 \
  --restart=always \
  --memory=512m \
  --cpus=1 \
  --env-file .env.prod \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  pair-lunch:v1.0.0
```

## トラブルシューティング

### ポートが既に使用されている場合

```bash
# 別のポートにマップ
docker run -d -p 8080:3000 pair-lunch:latest
```

### メモリ不足エラー

`.env` 内のメモリ制限を増やしてください：

```yaml
# docker-compose.yml
services:
  app:
    mem_limit: 1g
```

### キャッシュなしで再ビルド

```bash
docker-compose build --no-cache
```

## API との連携

このアプリケーションは Supabase をバックエンドデータベースとして使用しています。API は Vercel Functions として実装されており、環境変数経由で設定されます。

Dockerコンテナ内でローカルAPIを実行する場合は、以下の構成を参照してください：
- フロントエンド: ポート 3000 で実行
- API: 別の Docker コンテナまたは Vercel インスタンスで実行

## リソースのクリーンアップ

すべてのコンテナとイメージを削除する：

```bash
docker-compose down -v
docker rmi pair-lunch:latest
```

## 参考

- [Docker ドキュメント](https://docs.docker.com/)
- [Docker Compose ドキュメント](https://docs.docker.com/compose/)
