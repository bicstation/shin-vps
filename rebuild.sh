#!/bin/bash

# ==============================================================================

# 🚀 SHIN CORE LINX｜ADVANCED DEPLOY SCRIPT v4（最終強化版）

# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

PROJECT_NAME="shin-vps"
PROD_FILE="$SCRIPT_DIR/docker-compose.prod.yml"
LOCAL_FILE="$SCRIPT_DIR/docker-compose.yml"

ENV_FILE_LOCAL="$SCRIPT_DIR/.env.local"
ENV_FILE_PROD="$SCRIPT_DIR/.env.production"

NETWORK_NAME="shin-vps_shared-proxy"
SUFFIX="-v3"

INPUT_SERVICE=""
BUILD_ARGS=""
FORCE_ENV=""
MODE="up"
SHOW_LOGS=false
PRUNE=false
RESTART=false
SHELL=false
STATUS=false
RESET_DB=false
DEPLOY=false

# ------------------------------------------------------------------------------

# ■ ヘルプ

# ------------------------------------------------------------------------------

show_help() {
echo ""
echo "🚀 SHIN CORE LINX DEPLOY SCRIPT v4"
echo "------------------------------------------------------"
echo "Usage:"
echo "  ./rebuild.sh [SERVICE] [OPTIONS]"
echo ""
echo "Services:"
echo "  django, db, traefik, bicstation, tiper, saving, avflash"
echo ""
echo "Environment:"
echo "  --local       ローカル環境"
echo "  --prod        本番環境"
echo ""
echo "Build:"
echo "  --no-cache    キャッシュ無し"
echo "  --clean       フルクリーン（危険）"
echo ""
echo "Execution:"
echo "  --down        停止"
echo "  --build-only  ビルドのみ"
echo "  --up-only     起動のみ"
echo "  --restart     再起動"
echo ""
echo "Utility:"
echo "  --status      ヘルスチェック"
echo "  --reset-db    DB初期化（⚠️危険）"
echo "  --deploy      本番デプロイ（CI用）"
echo ""
echo "Debug:"
echo "  --logs        ログ表示"
echo "  --shell       Djangoシェル"
echo ""
echo "Examples:"
echo "  ./rebuild.sh --local"
echo "  ./rebuild.sh bicstation --local"
echo "  ./rebuild.sh --status"
echo "  ./rebuild.sh --reset-db --local"
echo "  ./rebuild.sh --deploy --prod"
echo ""
exit 0
}

# ------------------------------------------------------------------------------

# ■ 引数解析

# ------------------------------------------------------------------------------

for arg in "$@"; do
case "$arg" in
--help) show_help ;;
--prod) FORCE_ENV="PROD" ;;
--local) FORCE_ENV="LOCAL" ;;
--no-cache) BUILD_ARGS="--no-cache" ;;
--clean) PRUNE=true ;;
--logs) SHOW_LOGS=true ;;
--restart) RESTART=true ;;
--shell) SHELL=true ;;
--down) MODE="down" ;;
--build-only) MODE="build" ;;
--up-only) MODE="up_only" ;;
--status) STATUS=true ;;
--reset-db) RESET_DB=true ;;
--deploy) DEPLOY=true ;;
-*) echo "❌ Unknown option: $arg"; exit 1 ;;
*) INPUT_SERVICE="$arg" ;;
esac
done

# ------------------------------------------------------------------------------

# ■ 環境判定

# ------------------------------------------------------------------------------

detect_env() {
if [ "$FORCE_ENV" = "PROD" ]; then echo "PROD"; return; fi
if [ "$FORCE_ENV" = "LOCAL" ]; then echo "LOCAL"; return; fi
echo "LOCAL"
}

ENV_TYPE=$(detect_env)

if [ "$ENV_TYPE" = "PROD" ]; then
COMPOSE_FILE="$PROD_FILE"
ENV_FILE="$ENV_FILE_PROD"
else
COMPOSE_FILE="$LOCAL_FILE"
ENV_FILE="$ENV_FILE_LOCAL"
fi

echo "🌍 ENV: $ENV_TYPE"
echo "📄 COMPOSE: $COMPOSE_FILE"

# ------------------------------------------------------------------------------

# ■ STATUS

# ------------------------------------------------------------------------------

if [ "$STATUS" = true ]; then
echo "📊 SERVICE STATUS"
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
echo ""
echo "🌐 NETWORK"
docker network ls | grep $NETWORK_NAME || echo "❌ network not found"
exit 0
fi

# ------------------------------------------------------------------------------

# ■ RESET DB（危険）

# ------------------------------------------------------------------------------

if [ "$RESET_DB" = true ]; then
echo "⚠️ WARNING: 全DB削除されます"
read -p "Type 'YES' to continue: " confirm
if [ "$confirm" != "YES" ]; then
echo "❌ Canceled"
exit 1
fi

echo "🔥 Resetting DB..."
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down -v
docker volume prune -f
echo "✅ DB RESET COMPLETE"
exit 0
fi

# ------------------------------------------------------------------------------

# ■ DEPLOY（CI想定）

# ------------------------------------------------------------------------------

if [ "$DEPLOY" = true ]; then
echo "🚀 DEPLOY MODE"
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build --remove-orphans
sleep 5
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T django$SUFFIX python manage.py migrate --noinput || true
echo "✅ DEPLOY COMPLETE"
exit 0
fi

# ------------------------------------------------------------------------------

# ■ サービス解決

# ------------------------------------------------------------------------------

resolve_service() {
local s="$1"
if [ -z "$s" ]; then echo ""; return; fi
case "$s" in
django) echo "django$SUFFIX" ;;
db|postgres) echo "postgres-db$SUFFIX" ;;
traefik) echo "traefik" ;;
bicstation) echo "next-bicstation$SUFFIX" ;;
tiper) echo "next-tiper$SUFFIX" ;;
saving) echo "next-bic-saving$SUFFIX" ;;
avflash) echo "next-avflash$SUFFIX" ;;
*) echo "next-$s$SUFFIX" ;;
esac
}

TARGET_SERVICE=$(resolve_service "$INPUT_SERVICE")

# ------------------------------------------------------------------------------

# ■ CLEAN

# ------------------------------------------------------------------------------

if [ "$PRUNE" = true ]; then
echo "🚨 CLEAN BUILD"
docker system prune -af --volumes
fi

# ------------------------------------------------------------------------------

# ■ ネットワーク

# ------------------------------------------------------------------------------

docker network inspect "$NETWORK_NAME" >/dev/null 2>&1 || docker network create "$NETWORK_NAME"

# ------------------------------------------------------------------------------

# ■ DOWN

# ------------------------------------------------------------------------------

if [ "$MODE" = "down" ]; then
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down
exit 0
fi

# ------------------------------------------------------------------------------

# ■ BUILD

# ------------------------------------------------------------------------------

echo "🔨 BUILD"
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build $BUILD_ARGS $TARGET_SERVICE

# ------------------------------------------------------------------------------

# ■ UP

# ------------------------------------------------------------------------------

echo "🚀 UP"
if [ -z "$TARGET_SERVICE" ]; then
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans
else
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --no-deps "$TARGET_SERVICE"
fi

sleep 5

# ------------------------------------------------------------------------------

# ■ Django

# ------------------------------------------------------------------------------

if docker ps | grep -q "django$SUFFIX"; then
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T django$SUFFIX python manage.py migrate --noinput || true
fi

# ------------------------------------------------------------------------------

# ■ LOGS

# ------------------------------------------------------------------------------

if [ "$SHOW_LOGS" = true ]; then
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs -f "$TARGET_SERVICE"
else
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
fi
