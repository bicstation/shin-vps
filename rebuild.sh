#!/bin/bash
# ==============================================================================
# 🚀 SHIN-VPS v3.7: サービス名省略形・単独ビルド・完全クリーン対応
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOSTNAME=$(hostname)

# --- ヘルプ表示 ---
show_help() {
    echo "Usage: ./deploy.sh [SERVICE_SHORT_NAME] [OPTIONS]"
    echo ""
    echo "Arguments:"
    echo "  SERVICE_SHORT_NAME  サービス名の省略形 (例: bic-saving, tiper, django, station)"
    echo "                      ※ 'next-' や '-v3' は自動補完されます"
    echo ""
    echo "Options:"
    echo "  --no-cache      Dockerキャッシュを無視してビルド"
    echo "  --prune         ビルド前に未使用イメージ・キャッシュを完全削除"
    echo "  --logs          起動後にログを表示して待機"
    echo "  --help          ヘルプを表示"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh bic-saving --no-cache   # next-bic-saving-v3 をビルド"
    echo "  ./deploy.sh django --logs           # django-v3 をビルドしてログ監視"
    echo "  ./deploy.sh --prune                 # 全体をフルクリーンビルド"
    exit 0
}

# --- 環境判別 ---
if [[ "$HOSTNAME" == *"x162-43-73-204"* ]]; then
    ENV_TYPE="PROD"; COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"; SUFFIX="-v3"
else
    ENV_TYPE="LOCAL"; COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"; SUFFIX="-v3"
fi

# --- 引数解析 ---
INPUT_SERVICE=""
BUILD_ARGS=""
PRUNE_MODE=false
SHOW_LOGS=false

for arg in "$@"; do
    case "$arg" in
        --no-cache) BUILD_ARGS="--no-cache" ;;
        --prune)    PRUNE_MODE=true ;;
        --logs)     SHOW_LOGS=true ;;
        --help)     show_help ;;
        -*)         echo "❓ Unknown option: $arg"; show_help ;;
        *)          INPUT_SERVICE="$arg" ;; 
    esac
done

# --- サービス名の補完ロジック ---
TARGET_SERVICE=""
if [ -n "$INPUT_SERVICE" ]; then
    # すでにフルネームで入力されているか、接頭辞・接尾辞が必要か判定
    if [[ "$INPUT_SERVICE" == *"django"* ]]; then
        TARGET_SERVICE="django$SUFFIX"
    elif [[ "$INPUT_SERVICE" == "postgres" || "$INPUT_SERVICE" == "db" ]]; then
        TARGET_SERVICE="postgres-db$SUFFIX"
    elif [[ "$INPUT_SERVICE" == "proxy" || "$INPUT_SERVICE" == "traefik" ]]; then
        TARGET_SERVICE="traefik"
    elif [[ "$INPUT_SERVICE" == "dozzle" ]]; then
        TARGET_SERVICE="dozzle$SUFFIX"
    elif [[ "$INPUT_SERVICE" == "bicstation" || "$INPUT_SERVICE" == "station" ]]; then
         TARGET_SERVICE="next-bicstation$SUFFIX"
    else
        # その他 (bic-saving, tiper, avflash 等)
        # すでに next- がついていればそのまま、なければ付与
        [[ "$INPUT_SERVICE" =~ ^next- ]] && TMP="$INPUT_SERVICE" || TMP="next-$INPUT_SERVICE"
        # すでに -v3 がついていればそのまま、なければ付与
        [[ "$TMP" =~ $SUFFIX$ ]] && TARGET_SERVICE="$TMP" || TARGET_SERVICE="$TMP$SUFFIX"
    fi
    echo "🎯 [TARGET] Resolved service name: $TARGET_SERVICE"
fi

# --- 0. Prune処理 ---
if [ "$PRUNE_MODE" = true ]; then
    echo "🚨 [0/5] Pruning Docker system..."
    docker system prune -af --volumes
fi

# --- 1. 停止 & ネットワーククリーン ---
if [ -z "$TARGET_SERVICE" ]; then
    echo "🧹 [1/5] Cleaning up all containers..."
    docker compose -f "$COMPOSE_FILE" down --remove-orphans
    docker network rm $(docker network ls -q -f name=internal-net) 2>/dev/null || true
else
    echo "♻️ [1/5] Stopping: $TARGET_SERVICE"
    docker compose -f "$COMPOSE_FILE" stop "$TARGET_SERVICE"
fi

# --- 2. ビルド ---
echo "📍 [2/5] Building..."
docker compose -f "$COMPOSE_FILE" build $BUILD_ARGS $TARGET_SERVICE

# --- 3. 起動 ---
echo "📍 [3/5] Starting..."
if [ -z "$TARGET_SERVICE" ]; then
    docker compose -f "$COMPOSE_FILE" up -d --remove-orphans
else
    docker compose -f "$COMPOSE_FILE" up -d --no-deps "$TARGET_SERVICE"
fi

# --- 4. 起動待ち ---
if [ "$SHOW_LOGS" = false ]; then
    echo "⏳ Waiting 15 seconds for stabilization..."
    sleep 15
fi

# --- 5. Django後処理 ---
if [ -z "$TARGET_SERVICE" ] || [[ "$TARGET_SERVICE" == *"django"* ]]; then
    DJANGO_NAME="django$SUFFIX"
    if [ "$(docker ps -q -f name=$DJANGO_NAME)" ]; then
        echo "📦 [5/5] Running migrations & clearing cache..."
        docker compose -f "$COMPOSE_FILE" exec -T $DJANGO_NAME python manage.py migrate --noinput
        docker compose -f "$COMPOSE_FILE" exec -T $DJANGO_NAME python manage.py shell -c "from django.core.cache import cache; cache.clear()"
    fi
fi

echo "---------------------------------------------------"
echo "🎉 SHIN-VPS v3.7 [$ENV_TYPE] COMPLETED!"
echo "---------------------------------------------------"

if [ "$SHOW_LOGS" = true ] && [ -n "$TARGET_SERVICE" ]; then
    docker compose -f "$COMPOSE_FILE" logs -f "$TARGET_SERVICE"
else
    docker compose -f "$COMPOSE_FILE" ps
fi