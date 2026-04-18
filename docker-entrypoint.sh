#!/bin/sh
set -e

# HTML ファイルに環境変数を動的に注入
# Pylon の自動生成 Dockerfile は http-server を使用するため、/app/dist を参照
INDEX_FILE="/app/dist/index.html"

echo "🔄 Injecting environment variables into index.html..."
echo ""

# デバッグ: 受け取った環境変数を確認
echo "📋 Checking environment variables:"
echo "   VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-[NOT SET]}"
echo "   VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:-[NOT SET]}"
echo "   LW_CLIENT_ID=${LW_CLIENT_ID:-[NOT SET]}"
echo ""

if [ -f "$INDEX_FILE" ]; then
  # バックアップを作成
  cp "$INDEX_FILE" "$INDEX_FILE.bak"
  echo "✓ Backup created: $INDEX_FILE.bak"
  echo ""

  # sed で環境変数を置換（/ の代わりに | を区切り文字として使用）
  echo "🔧 Running sed replacements..."
  sed -i \
    "s|\${VITE_SUPABASE_URL}|${VITE_SUPABASE_URL}|g" \
    "s|\${VITE_SUPABASE_ANON_KEY}|${VITE_SUPABASE_ANON_KEY}|g" \
    "s|\${LW_CLIENT_ID}|${LW_CLIENT_ID}|g" \
    "s|\${LW_CLIENT_SECRET}|${LW_CLIENT_SECRET}|g" \
    "s|\${LW_SERVICE_ACCOUNT}|${LW_SERVICE_ACCOUNT}|g" \
    "s|\${LW_PRIVATE_KEY}|${LW_PRIVATE_KEY}|g" \
    "s|\${LW_BOT_ID}|${LW_BOT_ID}|g" \
    "s|\${LW_CHANNEL_ID}|${LW_CHANNEL_ID}|g" \
    "s|\${LW_FORM_ID}|${LW_FORM_ID}|g" \
    "s|\${LW_DOMAIN_ID}|${LW_DOMAIN_ID}|g" \
    "$INDEX_FILE"

  echo ""

  # 置換結果を確認
  echo "✅ Checking replacement results:"
  echo ""

  # テンプレート変数が残っているか確認
  if grep -q '\${VITE_SUPABASE_URL}' "$INDEX_FILE"; then
    echo "⚠️  WARNING: Template variable \${VITE_SUPABASE_URL} still exists!"
    echo "    This means VITE_SUPABASE_URL environment variable might not be set."
    echo ""
  fi

  # 実際の値が埋め込まれているか確認
  echo "📝 Current window.__env__ in index.html:"
  grep -A 10 "window.__env__" "$INDEX_FILE" | head -15

  echo ""
  echo "✅ Environment variables injected successfully"
else
  echo "❌ Error: $INDEX_FILE not found"
  echo "   Expected path: $INDEX_FILE"
  echo "   Available files in /app/dist:"
  ls -la /app/dist/ || echo "   /app/dist directory does not exist"
  exit 1
fi

echo ""
echo "🚀 Starting application..."
echo ""

# メインプロセスを実行
# Pylon の自動生成 Dockerfile は npm scripts や http-server で実行される想定
# ここでは、指定されたコマンドを実行
exec "$@"
