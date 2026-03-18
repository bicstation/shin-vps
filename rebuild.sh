#!/bin/bash
# ==============================================================================
# 🚀 SHIN-VPS v3.3: 完全修正版 (フラグ位置 & .env 読み込み)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOSTNAME=$(hostname)

# --- 環境判別 ---
if [[ "$HOSTNAME" == *"x162-43-73-204"* ]]; then
    ENV_TYPE="PROD"; COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"; SUFFIX="-v2"
    echo "🌐 [MODE] VPS Production detected."
else
    ENV_TYPE="LOCAL"; COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"; SUFFIX="-v3"
    echo "💻 [MODE] Local Development detected."
fi

# --- 引数解析 ---
BUILD_ARGS=""
for arg in "$@"; do
    if [ "$arg" == "--no-cache" ]; then BUILD_ARGS="--no-cache"; fi
done

# --- 1. ビルド & 起動 (ここを分離して確実に実行) ---
echo "📍 [1/3] Building images..."
docker compose -f "$COMPOSE_FILE" build $BUILD_ARGS

echo "📍 [2/3] Starting containers..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

# --- 2. 起動待ち ---
echo "⏳ Waiting 15 seconds for containers to stabilize..."
sleep 15

# --- 3. Django後処理 (コンテナが動いているか確認しながら実行) ---
DJANGO_NAME="django$SUFFIX"
if [ "$(docker ps -q -f name=$DJANGO_NAME)" ]; then
    echo "📦 [3/3] Running migrations..."
    docker compose -f "$COMPOSE_FILE" exec -T $DJANGO_NAME python manage.py migrate --noinput
else
    echo "❌ ERROR: $DJANGO_NAME is not running. Check 'docker compose logs $DJANGO_NAME'"
    exit 1
fi

echo "---------------------------------------------------"
echo "🎉 SHIN-VPS v3 [$ENV_TYPE] REBUILT!"
echo "---------------------------------------------------"
docker compose -f "$COMPOSE_FILE" ps