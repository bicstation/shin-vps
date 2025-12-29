#!/bin/bash

# 設定: 共通で使用するファイルパス
COMPOSE_FILE="/mnt/e/shin-vps/docker-compose.stg.yml"

echo "🚀 [1/4] コンテナを停止中..."
docker compose -f $COMPOSE_FILE down

echo "🧹 [2/4] 未使用のビルドキャッシュを削除中..."
docker system prune -f

echo "🛠️ [3/4] キャッシュなしで再ビルド中..."
docker compose -f $COMPOSE_FILE build --no-cache

echo "✨ [4/4] コンテナをバックグラウンドで起動中..."
docker compose -f $COMPOSE_FILE up -d

echo "✅ すべての工程が完了しました！"
echo "---------------------------------------"
docker compose -f $COMPOSE_FILE ps