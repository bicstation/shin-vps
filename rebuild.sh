#!/bin/bash

# ==============================================================================
# 🚀 SHIN CORE LINX｜ADVANCED DEPLOY SCRIPT v8 FINAL STABLE
# ==============================================================================
#
# ■ Multi Domain Infrastructure
# ■ LOCAL / SIM / PROD
# ■ WSL2 + Docker Desktop Stable Edition
# ■ Serial Build Stabilization
# ■ Next.js Multi-App Safe Build
#
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

PROJECT_NAME="shin-vps"

# ------------------------------------------------------------------------------
# ■ Compose Files
# ------------------------------------------------------------------------------

LOCAL_FILE="$SCRIPT_DIR/docker-compose.yml"

SIM_FILE="$SCRIPT_DIR/docker-compose.sim.yml"

PROD_FILE="$SCRIPT_DIR/docker-compose.prod.yml"

# ------------------------------------------------------------------------------
# ■ ENV Files
# ------------------------------------------------------------------------------

ENV_FILE_LOCAL="$SCRIPT_DIR/.env.local"

ENV_FILE_SIM="$SCRIPT_DIR/.env.production"

ENV_FILE_PROD="$SCRIPT_DIR/.env.production"

ENV_FILE_ROOT="$SCRIPT_DIR/.env"

# ------------------------------------------------------------------------------
# ■ Docker
# ------------------------------------------------------------------------------

NETWORK_NAME="shin-vps_shared-proxy"

SUFFIX="-v3"

# ------------------------------------------------------------------------------
# ■ Runtime
# ------------------------------------------------------------------------------

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

SERIAL_BUILD=true

# ------------------------------------------------------------------------------
# ■ BuildKit OFF（WSL安定化）
# ------------------------------------------------------------------------------

export DOCKER_BUILDKIT=0

# ------------------------------------------------------------------------------
# ■ Help
# ------------------------------------------------------------------------------

show_help() {

echo ""
echo "🚀 SHIN CORE LINX DEPLOY SCRIPT v8"
echo "======================================================"

echo ""
echo "📌 起動"
echo "------------------------------------------------------"

echo "■ Local Development"
echo "  ./rebuild.sh --local"

echo ""
echo "■ Production Simulation"
echo "  ./rebuild.sh --sim"

echo ""
echo "■ Production"
echo "  ./rebuild.sh --prod"

echo ""
echo "📌 Build"
echo "------------------------------------------------------"

echo "  ./rebuild.sh --build-only --local"
echo "  ./rebuild.sh --build-only --sim"
echo "  ./rebuild.sh --build-only --prod"

echo ""
echo "📌 Logs"
echo "------------------------------------------------------"

echo "  ./rebuild.sh --logs"

echo ""
echo "📌 Status"
echo "------------------------------------------------------"

echo "  ./rebuild.sh --status"

echo ""
echo "📌 Reset DB"
echo "------------------------------------------------------"

echo "  ./rebuild.sh --reset-db --sim"

echo ""
echo "📌 Clean Build"
echo "------------------------------------------------------"

echo "  ./rebuild.sh --clean"

echo ""
echo "📌 ENV"
echo "------------------------------------------------------"

echo "LOCAL : .env.local"
echo "SIM   : .env.production"
echo "PROD  : .env.production"

echo ""
exit 0
}

# ------------------------------------------------------------------------------
# ■ Args
# ------------------------------------------------------------------------------

for arg in "$@"; do
case "$arg" in

--help) show_help ;;

--local) FORCE_ENV="LOCAL" ;;

--sim) FORCE_ENV="SIM" ;;

--prod) FORCE_ENV="PROD" ;;

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

-*)
echo "❌ Unknown option: $arg"
exit 1
;;

*)
INPUT_SERVICE="$arg"
;;

esac
done

# ------------------------------------------------------------------------------
# ■ Environment Detect
# ------------------------------------------------------------------------------

detect_env() {

if [ "$FORCE_ENV" = "PROD" ]; then
echo "PROD"
return
fi

if [ "$FORCE_ENV" = "SIM" ]; then
echo "SIM"
return
fi

if [ "$FORCE_ENV" = "LOCAL" ]; then
echo "LOCAL"
return
fi

echo "LOCAL"
}

ENV_TYPE=$(detect_env)

# ------------------------------------------------------------------------------
# ■ Compose / ENV Select
# ------------------------------------------------------------------------------

if [ "$ENV_TYPE" = "PROD" ]; then

COMPOSE_FILE="$PROD_FILE"

ENV_FILE="$ENV_FILE_PROD"

elif [ "$ENV_TYPE" = "SIM" ]; then

COMPOSE_FILE="$SIM_FILE"

ENV_FILE="$ENV_FILE_SIM"

else

COMPOSE_FILE="$LOCAL_FILE"

ENV_FILE="$ENV_FILE_LOCAL"

fi

# ------------------------------------------------------------------------------
# ■ Info
# ------------------------------------------------------------------------------

echo ""
echo "🌍 ENV: $ENV_TYPE"

echo "📄 COMPOSE: $COMPOSE_FILE"

echo "📦 ENV FILE: $ENV_FILE"

echo ""

# ------------------------------------------------------------------------------
# ■ ENV Check
# ------------------------------------------------------------------------------

if [ ! -f "$ENV_FILE" ]; then

echo "❌ ENV FILE NOT FOUND"

echo "$ENV_FILE"

exit 1

fi

# ------------------------------------------------------------------------------
# ■ ENV Sync
# ------------------------------------------------------------------------------

echo "📦 Sync ENV → .env"

cp "$ENV_FILE" "$ENV_FILE_ROOT"

# ------------------------------------------------------------------------------
# ■ Status
# ------------------------------------------------------------------------------

if [ "$STATUS" = true ]; then

docker compose \
-p $PROJECT_NAME \
--env-file "$ENV_FILE" \
-f "$COMPOSE_FILE" \
ps

exit 0

fi

# ------------------------------------------------------------------------------
# ■ Reset DB
# ------------------------------------------------------------------------------

if [ "$RESET_DB" = true ]; then

echo "⚠️ WARNING: DB完全削除"

read -p "Type 'YES' to continue: " confirm

if [ "$confirm" != "YES" ]; then

echo "❌ Canceled"

exit 1

fi

docker compose \
-p $PROJECT_NAME \
--env-file "$ENV_FILE" \
-f "$COMPOSE_FILE" \
down -v

docker volume prune -f

echo "✅ DB RESET COMPLETE"

exit 0

fi

# ------------------------------------------------------------------------------
# ■ Clean
# ------------------------------------------------------------------------------

if [ "$PRUNE" = true ]; then

echo "🚨 CLEAN BUILD"

docker system prune -af

docker builder prune -af

rm -rf ~/.npm

fi

# ------------------------------------------------------------------------------
# ■ Network
# ------------------------------------------------------------------------------

docker network inspect "$NETWORK_NAME" >/dev/null 2>&1 || \
docker network create "$NETWORK_NAME"

# ------------------------------------------------------------------------------
# ■ Down
# ------------------------------------------------------------------------------

if [ "$MODE" = "down" ]; then

docker compose \
-p $PROJECT_NAME \
--env-file "$ENV_FILE" \
-f "$COMPOSE_FILE" \
down

exit 0

fi

# ------------------------------------------------------------------------------
# ■ Serial Build（超重要）
# ------------------------------------------------------------------------------

echo "🔨 SERIAL BUILD MODE"

build_service() {

SERVICE_NAME=$1

echo ""
echo "======================================================"
echo "🚀 BUILD: $SERVICE_NAME"
echo "======================================================"

docker compose \
-p $PROJECT_NAME \
--env-file "$ENV_FILE" \
-f "$COMPOSE_FILE" \
build $BUILD_ARGS $SERVICE_NAME
}

# ------------------------------------------------------------------------------
# ■ Core Build
# ------------------------------------------------------------------------------

build_service django-v3

build_service next-bicstation-v3

build_service next-bic-saving-v3

build_service next-tiper-v3

build_service next-avflash-v3

# ------------------------------------------------------------------------------
# ■ Up
# ------------------------------------------------------------------------------

echo ""
echo "🚀 START CONTAINERS"

docker compose \
-p $PROJECT_NAME \
--env-file "$ENV_FILE" \
-f "$COMPOSE_FILE" \
up -d --remove-orphans

sleep 5

# ------------------------------------------------------------------------------
# ■ Migration
# ------------------------------------------------------------------------------

if docker ps | grep -q "django$SUFFIX"; then

echo ""
echo "📦 Running migrations..."

docker compose \
-p $PROJECT_NAME \
--env-file "$ENV_FILE" \
-f "$COMPOSE_FILE" \
exec -T django$SUFFIX \
python manage.py migrate --noinput

fi

# ------------------------------------------------------------------------------
# ■ Status
# ------------------------------------------------------------------------------

echo ""
echo "📊 CONTAINER STATUS"

docker compose \
-p $PROJECT_NAME \
--env-file "$ENV_FILE" \
-f "$COMPOSE_FILE" \
ps

# ------------------------------------------------------------------------------
# ■ Logs
# ------------------------------------------------------------------------------

if [ "$SHOW_LOGS" = true ]; then

echo ""
echo "📜 STREAM LOGS"

docker compose \
-p $PROJECT_NAME \
--env-file "$ENV_FILE" \
-f "$COMPOSE_FILE" \
logs -f

fi

# ------------------------------------------------------------------------------
# ■ Done
# ------------------------------------------------------------------------------

echo ""
echo "✅ SHIN CORE LINX DEPLOY COMPLETE"
echo ""