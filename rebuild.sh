#!/bin/bash
# ==============================================================================
# 🚀 SHIN-VPS v4.0: 自動環境判別 + 強制切替 + 安全ネットワーク + 本番対応
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOSTNAME=$(hostname)

PROJECT_NAME="shin-vps"
PROD_FILE="$SCRIPT_DIR/docker-compose.prod.yml"
LOCAL_FILE="$SCRIPT_DIR/docker-compose.yml"
NETWORK_NAME="${PROJECT_NAME}_shared-proxy"
SUFFIX="-v3"

# --- ヘルプ ---
show_help() {
    echo "Usage: ./deploy.sh [SERVICE] [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --prod        強制的に本番構成を使用"
    echo "  --local       強制的にローカル構成を使用"
    echo "  --no-cache    キャッシュ無しビルド"
    echo "  --prune       完全クリーン"
    echo "  --logs        ログ監視"
    echo ""
    echo "Examples:"
    echo "  ./rebuild.sh --prod"
    echo "  ./rebuild.sh tiper --prod"
    echo "  ./rebuild.sh django --logs"
    exit 0
}

# --- 引数解析 ---
INPUT_SERVICE=""
BUILD_ARGS=""
PRUNE=false
SHOW_LOGS=false
FORCE_ENV=""

for arg in "$@"; do
    case "$arg" in
        --prod) FORCE_ENV="PROD" ;;
        --local) FORCE_ENV="LOCAL" ;;
        --no-cache) BUILD_ARGS="--no-cache" ;;
        --prune) PRUNE=true ;;
        --logs) SHOW_LOGS=true ;;
        --help) show_help ;;
        -*) echo "❌ Unknown option: $arg"; exit 1 ;;
        *) INPUT_SERVICE="$arg" ;;
    esac
done

# --- 環境自動判別（ここがコア） ---
detect_env() {
    # 強制指定優先
    if [ "$FORCE_ENV" = "PROD" ]; then
        echo "PROD"; return
    elif [ "$FORCE_ENV" = "LOCAL" ]; then
        echo "LOCAL"; return
    fi

    # VPS判定（安全版）
    if curl -s --connect-timeout 1 http://169.254.169.254 >/dev/null 2>&1; then
        echo "PROD"; return
    fi

    # Docker内 or WSLでもLOCAL扱い
    echo "LOCAL"
}

ENV_TYPE=$(detect_env)

if [ "$ENV_TYPE" = "PROD" ]; then
    COMPOSE_FILE="$PROD_FILE"
else
    COMPOSE_FILE="$LOCAL_FILE"
fi

echo "🌍 ENV: $ENV_TYPE"
echo "📄 COMPOSE: $COMPOSE_FILE"

# --- サービス補完 ---
resolve_service() {
    local s="$1"

    if [ -z "$s" ]; then
        echo ""
        return
    fi

    if [[ "$s" == *"django"* ]]; then
        echo "django$SUFFIX"
    elif [[ "$s" == "db" || "$s" == "postgres" ]]; then
        echo "postgres-db$SUFFIX"
    elif [[ "$s" == "proxy" || "$s" == "traefik" ]]; then
        echo "traefik"
    elif [[ "$s" == "station" || "$s" == "bicstation" ]]; then
        echo "next-bicstation$SUFFIX"
    else
        [[ "$s" =~ ^next- ]] && TMP="$s" || TMP="next-$s"
        [[ "$TMP" =~ $SUFFIX$ ]] && echo "$TMP" || echo "$TMP$SUFFIX"
    fi
}

TARGET_SERVICE=$(resolve_service "$INPUT_SERVICE")

[ -n "$TARGET_SERVICE" ] && echo "🎯 TARGET: $TARGET_SERVICE"

# --- 0. prune ---
if [ "$PRUNE" = true ]; then
    echo "🚨 FULL CLEAN"
    docker system prune -af --volumes
fi

# --- 1. ネットワーク保証（重要） ---
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
    echo "🌐 Creating network: $NETWORK_NAME"
    docker network create "$NETWORK_NAME"
fi

# --- 2. stop ---
if [ -z "$TARGET_SERVICE" ]; then
    echo "🧹 DOWN ALL"
    docker compose -p $PROJECT_NAME -f "$COMPOSE_FILE" down --remove-orphans
else
    echo "♻️ STOP $TARGET_SERVICE"
    docker compose -p $PROJECT_NAME -f "$COMPOSE_FILE" stop "$TARGET_SERVICE"
fi

# --- 3. build ---
echo "🔨 BUILD"
docker compose -p $PROJECT_NAME -f "$COMPOSE_FILE" build $BUILD_ARGS $TARGET_SERVICE

# --- 4. up ---
echo "🚀 UP"
if [ -z "$TARGET_SERVICE" ]; then
    docker compose -p $PROJECT_NAME -f "$COMPOSE_FILE" up -d --remove-orphans
else
    docker compose -p $PROJECT_NAME -f "$COMPOSE_FILE" up -d --no-deps "$TARGET_SERVICE"
fi

# --- 5. wait ---
sleep 10

# --- 6. Django処理 ---
DJANGO_NAME="django$SUFFIX"
if docker ps | grep -q "$DJANGO_NAME"; then
    echo "📦 Django migrate"
    docker compose -p $PROJECT_NAME -f "$COMPOSE_FILE" exec -T $DJANGO_NAME python manage.py migrate --noinput || true

    echo "🧹 cache clear"
    docker compose -p $PROJECT_NAME -f "$COMPOSE_FILE" exec -T $DJANGO_NAME python manage.py shell -c "from django.core.cache import cache; cache.clear()" || true
fi

echo "--------------------------------------------------"
echo "✅ DONE [$ENV_TYPE]"
echo "--------------------------------------------------"

# --- logs or ps ---
if [ "$SHOW_LOGS" = true ] && [ -n "$TARGET_SERVICE" ]; then
    docker compose -p $PROJECT_NAME -f "$COMPOSE_FILE" logs -f "$TARGET_SERVICE"
else
    docker compose -p $PROJECT_NAME -f "$COMPOSE_FILE" ps
fi