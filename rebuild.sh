#!/bin/bash
# ==============================================================================
# 🚀 SHIN-VPS v3.4: 自動ネットワーク修復 & クリーンビルド対応版
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOSTNAME=$(hostname)

# --- 環境判別 ---
if [[ "$HOSTNAME" == *"x162-43-73-204"* ]]; then
    ENV_TYPE="PROD"; COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"; SUFFIX="-v3"
    echo "🌐 [MODE] VPS Production detected."
else
    ENV_TYPE="LOCAL"; COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"; SUFFIX="-v3"
    echo "💻 [MODE] Local Development detected."
fi

# --- 引数解析 ---
BUILD_ARGS=""
CLEAN_MODE=false
for arg in "$@"; do
    if [ "$arg" == "--no-cache" ]; then 
        BUILD_ARGS="--no-cache"
        CLEAN_MODE=true
    fi
done

# --- 0. ネットワークの不整合を事前に破壊 (予防措置) ---
echo "🧹 [0/3] Cleaning up old network artifacts..."
# コンテナを一度安全に停止
docker compose -f "$COMPOSE_FILE" down --remove-orphans

# IPv6エラーの元凶となるネットワークを強制削除（エラーは無視）
# ネットワーク名は docker-compose.yml の project 名が付与されるためワイルドカードで指定
docker network rm $(docker network ls -q -f name=internal-net) 2>/dev/null || true

# --- 1. ビルド ---
echo "📍 [1/3] Building images..."
docker compose -f "$COMPOSE_FILE" build $BUILD_ARGS

# --- 2. 起動 ---
echo "📍 [2/3] Starting containers..."
# ここで新しいネットワークが正しい設定で再生成されます
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

# --- 3. 起動待ち ---
echo "⏳ Waiting 15 seconds for containers to stabilize..."
sleep 15

# --- 4. Django後処理 ---
DJANGO_NAME="django$SUFFIX"
# コンテナ名を正確に判定（プロジェクト名を含んだ名前でチェック）
if [ "$(docker ps -q -f name=$DJANGO_NAME)" ]; then
    echo "📦 [3/3] Running migrations..."
    docker compose -f "$COMPOSE_FILE" exec -T $DJANGO_NAME python manage.py migrate --noinput
    
    echo "🧹 Clearing Django cache..."
    docker compose -f "$COMPOSE_FILE" exec -T $DJANGO_NAME python manage.py shell -c "from django.core.cache import cache; cache.clear()"
else
    echo "❌ ERROR: $DJANGO_NAME is not running. Check 'docker compose logs $DJANGO_NAME'"
    exit 1
fi

echo "---------------------------------------------------"
echo "🎉 SHIN-VPS v3.4 [$ENV_TYPE] REBUILT & RECOVERED!"
echo "---------------------------------------------------"
docker compose -f "$COMPOSE_FILE" ps