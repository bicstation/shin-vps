#!/bin/bash

# /mnt/c/dev/SHIN-VPS/rebuild.sh

# 設定: 共通で使用するファイルパス
COMPOSE_FILE="/mnt/e/shin-vps/docker-compose.stg.yml"
# COMPOSE_FILE="/mnt/c/dev/SHIN-VPS/docker-compose.stg.yml"
# COMPOSE_FILE="/home/maya/shin-vps/docker-compose.stg.yml"
# docker compose -f docker-compose.stg.yml ps -a 

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