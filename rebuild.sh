#!/bin/bash

# ==============================================================================
# 🚀 SHIN CORE LINX｜ADVANCED DEPLOY SCRIPT v6（完全安定版）
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
echo "🚀 SHIN CORE LINX DEPLOY SCRIPT v6"
echo "------------------------------------------------------"

echo ""
echo "📌 基本操作（まずこれ）"
echo "------------------------------------------------------"
echo "起動（ローカル）:"
echo "  ./rebuild.sh --local"
echo ""
echo "起動（本番）:"
echo "  ./rebuild.sh --prod"
echo ""
echo "状態確認:"
echo "  ./rebuild.sh --status"
echo ""

echo ""
echo "🔄 DBリセット（トラブル時）"
echo "------------------------------------------------------"
echo "完全リセット（⚠️全削除）:"
echo "  ./rebuild.sh --reset-db --local"
echo ""
echo "→ 実行後に必ず:"
echo "  ./rebuild.sh --local"
echo ""

echo ""
echo "🚀 デプロイ（本番）"
echo "------------------------------------------------------"
echo "  ./rebuild.sh --deploy --prod"
echo ""

echo ""
echo "🔧 開発用操作"
echo "------------------------------------------------------"
echo "ビルドのみ:"
echo "  ./rebuild.sh --build-only --local"
echo ""
echo "再起動:"
echo "  ./rebuild.sh --restart"
echo ""
echo "ログ確認:"
echo "  ./rebuild.sh --logs"
echo ""

echo ""
echo "⚠️ ENV変更ルール（超重要）"
echo "------------------------------------------------------"
echo ".env.local / .env.production を変更した場合:"
echo "  必ず再ビルドしてください"
echo ""
echo "理由:"
echo "  Next.jsはビルド時にENVを固定するため"
echo ""

echo ""
echo "🚨 よくあるトラブルと対処"
echo "------------------------------------------------------"
echo "① APIが空（データ0件）"
echo "  → DBリセット後に再インポート"
echo ""
echo "② migrateエラー"
echo "  → --reset-db 実行"
echo ""
echo "③ 画面が更新されない"
echo "  → --no-cache でビルド"
echo ""

echo ""
echo "💡 Tips"
echo "------------------------------------------------------"
echo "・迷ったらまず --local で再起動"
echo "・エラーは無視せず必ず確認"
echo "・DB系は基本リセットが最速"
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
# ■ ENVチェック
# ------------------------------------------------------------------------------

echo "🔍 ENV CHECK"
if [ ! -f "$ENV_FILE" ]; then
echo "❌ ENV FILE NOT FOUND: $ENV_FILE"
exit 1
fi


# ------------------------------------------------------------------------------
# ■ ENVコピー（安全装置）
# ------------------------------------------------------------------------------

ENV_FILE_ROOT="$SCRIPT_DIR/.env"

echo "📦 Sync .env.local → .env"
cp "$ENV_FILE" "$ENV_FILE_ROOT"

# ------------------------------------------------------------------------------
# ■ STATUS
# ------------------------------------------------------------------------------

if [ "$STATUS" = true ]; then
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
exit 0
fi

# ------------------------------------------------------------------------------
# ■ RESET DB（安全版）
# ------------------------------------------------------------------------------

if [ "$RESET_DB" = true ]; then
echo "⚠️ WARNING: DB完全削除されます"
read -p "Type 'YES' to continue: " confirm
if [ "$confirm" != "YES" ]; then
echo "❌ Canceled"
exit 1
fi

echo "🔥 Resetting DB..."
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down -v
echo "✅ DB RESET COMPLETE"
exit 0
fi

# ------------------------------------------------------------------------------
# ■ DEPLOY
# ------------------------------------------------------------------------------

if [ "$DEPLOY" = true ]; then
echo "🚀 DEPLOY MODE"

docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build --remove-orphans

sleep 5

echo "📦 Running migrations..."
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T django$SUFFIX python manage.py migrate --noinput

echo "✅ DEPLOY COMPLETE"
exit 0
fi

# ------------------------------------------------------------------------------
# ■ CLEAN
# ------------------------------------------------------------------------------

if [ "$PRUNE" = true ]; then
echo "🚨 CLEAN BUILD"
docker system prune -af
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
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build $BUILD_ARGS

# ------------------------------------------------------------------------------
# ■ UP
# ------------------------------------------------------------------------------

echo "🚀 UP"
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans

sleep 5

# ------------------------------------------------------------------------------
# ■ MIGRATE（安全版）
# ------------------------------------------------------------------------------

if docker ps | grep -q "django$SUFFIX"; then
echo "📦 Running migrations..."
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T django$SUFFIX python manage.py migrate --noinput
fi

# ------------------------------------------------------------------------------
# ■ LOGS
# ------------------------------------------------------------------------------

if [ "$SHOW_LOGS" = true ]; then
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs -f
else
docker compose -p $PROJECT_NAME --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
fi