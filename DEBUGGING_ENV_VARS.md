# 環境変数の受け取り確認ガイド

## 🔍 問題: 環境変数が正しく受け取れているか不確かな場合

## ✅ 確認ステップ

### ステップ 1: 環境変数が shell に渡されているか確認

```bash
# docker-entrypoint.sh が実行されるときに、
# 環境変数が正しく渡されているか確認

docker run -d \
  --name test-pair-lunch \
  -p 3000:3000 \
  -e VITE_SUPABASE_URL="https://qmcnzfablczxxpdlyvhy.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="sb_publishable_J01EzipTdPvs7QVD-ZUbGQ_rc9NCrcQ" \
  --entrypoint /app/docker-entrypoint.sh \
  pair-lunch:latest

# ログを確認
docker logs test-pair-lunch
```

**期待されるログ:**
```
🔄 Injecting environment variables into index.html...

📋 Checking environment variables:
   VITE_SUPABASE_URL=https://qmcnzfablczxxpdlyvhy.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_J01EzipTdPvs7QVD-ZUbGQ_rc9NCrcQ

✓ Backup created: /usr/share/nginx/html/index.html.bak

🔧 Running sed replacements...

✅ Checking replacement results:

📝 Current window.__env__ in index.html:
      window.__env__ = {
        VITE_SUPABASE_URL: 'https://qmcnzfablczxxpdlyvhy.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'sb_publishable_J01EzipTdPvs7QVD-ZUbGQ_rc9NCrcQ',
```

### ステップ 2: HTML ファイルを直接確認

```bash
# コンテナ内の index.html を確認
docker exec test-pair-lunch cat /usr/share/nginx/html/index.html | grep -A 15 "window.__env__"
```

**✅ 正しい例:**
```javascript
window.__env__ = {
  VITE_SUPABASE_URL: 'https://qmcnzfablczxxpdlyvhy.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'sb_publishable_J01EzipTdPvs7QVD-ZUbGQ_rc9NCrcQ',
  ...
}
```

**❌ 間違った例（テンプレート変数が残っている）:**
```javascript
window.__env__ = {
  VITE_SUPABASE_URL: '${VITE_SUPABASE_URL}',
  VITE_SUPABASE_ANON_KEY: '${VITE_SUPABASE_ANON_KEY}',
  ...
}
```

### ステップ 3: ブラウザで確認

```bash
# ブラウザで http://localhost:3000 にアクセス
# ブラウザコンソール（F12）を開く

# コンソールに貼り付け：
console.log(window.__env__)

# 以下のように表示される：
// {
//   VITE_SUPABASE_URL: "https://qmcnzfablczxxpdlyvhy.supabase.co",
//   VITE_SUPABASE_ANON_KEY: "sb_publishable_J01EzipTdPvs7QVD-ZUbGQ_rc9NCrcQ",
//   ...
// }
```

## 🐛 よくあるエラーと原因

### 問題 1: テンプレート変数が残っている

```
window.__env__ = {
  VITE_SUPABASE_URL: '${VITE_SUPABASE_URL}',  ← これが残っている
}
```

**原因:**

#### 1-1. entrypoint が設定されていない
```yaml
# ❌ 間違い
services:
  pair-lunch:
    image: pair-lunch:latest
    # ENTRYPOINT が設定されていない → docker-entrypoint.sh が実行されない

# ✅ 正しい
services:
  pair-lunch:
    image: pair-lunch:latest
    entrypoint: /app/docker-entrypoint.sh
```

#### 1-2. 環境変数が渡されていない
```bash
# ❌ 間違い
docker run pair-lunch:latest
# 環境変数が渡されていない

# ✅ 正しい
docker run \
  -e VITE_SUPABASE_URL=https://xxx \
  -e VITE_SUPABASE_ANON_KEY=xxx \
  pair-lunch:latest
```

#### 1-3. docker-entrypoint.sh のパスが間違っている
```bash
# ❌ 間違い
entrypoint: /entrypoint.sh  # 存在しないパス

# ✅ 正しい
entrypoint: /app/docker-entrypoint.sh
```

**解決方法:**
```bash
# 1. Pylon の docker-compose.yml または Dockerfile を確認
grep -n "entrypoint" docker-compose.yml
grep -n "ENTRYPOINT" Dockerfile

# 2. 環境変数が正しく設定されているか確認
docker run -e VITE_SUPABASE_URL=test pair-lunch:latest /app/docker-entrypoint.sh

# 3. entrypoint が実行されているか確認
docker logs pair-lunch | grep "Injecting environment"
```

### 問題 2: shell 変数が展開されていない

**原因**: sed コマンドで環境変数が展開されない

```bash
# ❌ 間違い - シングルクォートで括られている
sed -i 's|\${VITE_SUPABASE_URL}|${VITE_SUPABASE_URL}|g' file.html
# shell は '...' の中では変数を展開しない

# ✅ 正しい - ダブルクォートで括られている
sed -i "s|\${VITE_SUPABASE_URL}|${VITE_SUPABASE_URL}|g" file.html
# shell は "..." の中では変数を展開する
```

pair-lunch の docker-entrypoint.sh はダブルクォートを使用しているので大丈夫です。

### 問題 3: sed の区切り文字が干渉している

**原因**: URL に `/` が含まれていて、sed の区切り文字と衝突

```bash
# ❌ 間違い - / を区切り文字に使用
sed -i "s/${VITE_SUPABASE_URL}/new_url/g" file.html
# URL に含まれる / が sed コマンドを破壊

# ✅ 正しい - | を区切り文字に使用
sed -i "s|${VITE_SUPABASE_URL}|new_url|g" file.html
# | は URL に含まれないので安全
```

pair-lunch の docker-entrypoint.sh は `|` を使用しているので大丈夫です。

## 🔧 手動でテストする方法

### オプション A: docker exec で手動実行

```bash
# コンテナを実行中のまま、手動で sed を実行
docker exec test-pair-lunch /app/docker-entrypoint.sh
```

### オプション B: テスト用の Dockerfile で検証

```dockerfile
FROM pair-lunch:latest

# テスト用に、環境変数をハードコード
ENV VITE_SUPABASE_URL=https://test.supabase.co
ENV VITE_SUPABASE_ANON_KEY=test-key-123

# 実行時に entrypoint を指定
ENTRYPOINT ["/app/docker-entrypoint.sh"]
```

```bash
docker build -t pair-lunch:test -f Dockerfile.test .
docker run -it pair-lunch:test
```

## 📋 チェックリスト

- [ ] Pylon の Dockerfile で `COPY docker-entrypoint.sh` を実行しているか
- [ ] Pylon の Dockerfile で `ENTRYPOINT ["/app/docker-entrypoint.sh"]` を設定しているか
- [ ] docker-compose.yml で `entrypoint: /app/docker-entrypoint.sh` を設定しているか
- [ ] docker run コマンドで `-e VITE_SUPABASE_URL=...` を指定しているか
- [ ] `docker logs` で「Checking environment variables」メッセージが表示されているか
- [ ] ブラウザコンソールで `window.__env__` に実際の値が表示されているか
- [ ] HTML で `${VITE_SUPABASE_URL}` のようなテンプレート変数が残っていないか

## 📞 サポート情報

問題が解決しない場合：

```bash
# 以下の情報を収集してください
echo "=== Debugging Information ==="
echo "1. Docker logs:"
docker logs pair-lunch-app

echo ""
echo "2. Environment variables in container:"
docker exec pair-lunch-app env | grep -E "^(VITE_|LW_)"

echo ""
echo "3. HTML content (window.__env__ part):"
docker exec pair-lunch-app grep -A 15 "window.__env__" /usr/share/nginx/html/index.html

echo ""
echo "4. docker-entrypoint.sh exists:"
docker exec pair-lunch-app ls -la /app/docker-entrypoint.sh
```

これらの情報を確認して、どこで環境変数が失われているかを特定できます。
