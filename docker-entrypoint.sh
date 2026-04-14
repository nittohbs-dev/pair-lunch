#!/bin/sh

# .env.exampleから.envに自動コピー（.envが存在しない場合のみ）
if [ ! -f .env ] && [ -f .env.example ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ".env created successfully"
fi

# メインコマンドを実行
exec "$@"
