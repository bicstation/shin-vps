#!/usr/bin/env bash
# ==============================================================================
# 🚀 SHIN CORE LINX｜UNIFIED RUNTIME ORCHESTRATOR v16
# Multi-Universe Runtime Operations Authority
# ==============================================================================
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_COMPOSE="$SCRIPT_DIR/docker-compose.yml"
LOCAL_COMPOSE="$SCRIPT_DIR/docker-compose.local.yml"
STG_COMPOSE="$SCRIPT_DIR/docker-compose.stg.yml"
PROD_COMPOSE="$SCRIPT_DIR/docker-compose.prod.yml"
ENV_LOCAL="$SCRIPT_DIR/.env.local"
ENV_STG="$SCRIPT_DIR/.env.stg"
ENV_PROD="$SCRIPT_DIR/.env.production"
ENV_ROOT="$SCRIPT_DIR/.env"
ENV_TYPE="LOCAL"
MODE="up"
SHOW_LOGS=false
FOLLOW_LOGS=false
NO_CACHE=false
PARALLEL=false
PRUNE=false
RESET_DB=false
RESTART=false
STATUS=false
SHELL_MODE=false
EXEC_MODE=false
MIGRATE=false
COLLECTSTATIC=false
STOP=false
INPUT_SERVICE=""
EXEC_COMMAND=""
export DOCKER_BUILDKIT=1

show_help() {
echo ""
echo "============================================================================"
echo "🚀 SHIN CORE LINX｜UNIFIED RUNTIME ORCHESTRATOR"
echo "============================================================================"
echo ""
echo "🌍 ENVIRONMENTS"
echo "  ./rebuild.sh --local"
echo "  ./rebuild.sh --stg"
echo "  ./rebuild.sh --prod"
echo ""
echo "🔨 BUILD"
echo "  ./rebuild.sh --build-only --prod"
echo "  ./rebuild.sh --stg --parallel"
echo "  ./rebuild.sh --prod --no-cache"
echo ""
echo "📦 CONTAINERS"
echo "  ./rebuild.sh --down --prod"
echo "  ./rebuild.sh --restart --stg"
echo "  ./rebuild.sh --stop --local"
echo ""
echo "📜 LOGS"
echo "  ./rebuild.sh --logs"
echo "  ./rebuild.sh --logs django-v3"
echo "  ./rebuild.sh --follow-logs django-v3"
echo ""
echo "🐚 SHELL"
echo "  ./rebuild.sh --shell django-v3"
echo "  ./rebuild.sh --shell postgres-db-v3"
echo ""
echo "⚙️ DJANGO"
echo "  ./rebuild.sh --migrate"
echo "  ./rebuild.sh --collectstatic"
echo ""
echo "🛢 DATABASE"
echo "  ./rebuild.sh --reset-db"
echo ""
echo "📊 STATUS"
echo "  ./rebuild.sh --status"
echo ""
echo "🧹 CLEANUP"
echo "  ./rebuild.sh --clean"
echo ""
echo "============================================================================"
echo ""
exit 0
}

while [[ $# -gt 0 ]]; do
case "$1" in
--help) show_help ;;
--local) ENV_TYPE="LOCAL"; shift ;;
--stg) ENV_TYPE="STG"; shift ;;
--prod) ENV_TYPE="PROD"; shift ;;
--parallel) PARALLEL=true; shift ;;
--no-cache) NO_CACHE=true; shift ;;
--clean) PRUNE=true; shift ;;
--logs)
SHOW_LOGS=true
if [[ -n "$2" && "$2" != --* ]]; then INPUT_SERVICE="$2"; shift; fi
shift
;;
--follow-logs)
FOLLOW_LOGS=true
if [[ -n "$2" && "$2" != --* ]]; then INPUT_SERVICE="$2"; shift; fi
shift
;;
--down) MODE="down"; shift ;;
--stop) STOP=true; shift ;;
--restart) RESTART=true; shift ;;
--build-only) MODE="build"; shift ;;
--status) STATUS=true; shift ;;
--reset-db) RESET_DB=true; shift ;;
--shell)
SHELL_MODE=true
if [[ -n "$2" ]]; then INPUT_SERVICE="$2"; shift; fi
shift
;;
--exec)
EXEC_MODE=true
INPUT_SERVICE="$2"
EXEC_COMMAND="$3"
shift 3
;;
--migrate) MIGRATE=true; shift ;;
--collectstatic) COLLECTSTATIC=true; shift ;;
*) echo "❌ Unknown option: $1"; exit 1 ;;
esac
done

if [ "$ENV_TYPE" = "PROD" ]; then
OVERRIDE_COMPOSE="$PROD_COMPOSE"
ENV_FILE="$ENV_PROD"
PROJECT_NAME="shin-prod"
elif [ "$ENV_TYPE" = "STG" ]; then
OVERRIDE_COMPOSE="$STG_COMPOSE"
ENV_FILE="$ENV_STG"
PROJECT_NAME="shin-stg"
else
OVERRIDE_COMPOSE="$LOCAL_COMPOSE"
ENV_FILE="$ENV_LOCAL"
PROJECT_NAME="shin-local"
fi

[ -f "$BASE_COMPOSE" ] || { echo "❌ BASE COMPOSE NOT FOUND: $BASE_COMPOSE"; exit 1; }
[ -f "$OVERRIDE_COMPOSE" ] || { echo "❌ OVERRIDE COMPOSE NOT FOUND: $OVERRIDE_COMPOSE"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "❌ ENV FILE NOT FOUND: $ENV_FILE"; exit 1; }

set -a
source "$ENV_FILE"
set +a

if [ "$ENV_TYPE" = "PROD" ]; then
echo ""
echo "⚠️ PRODUCTION RUNTIME"
echo ""
read -p "Continue? (yes/no): " confirm
[ "$confirm" = "yes" ] || { echo "❌ Operation cancelled"; exit 1; }
fi

echo ""
echo "============================================================"
echo "🚀 SHIN CORE LINX｜ACTIVE RUNTIME UNIVERSE"
echo "============================================================"
echo ""
echo "🌍 ENVIRONMENT : $ENV_TYPE"
echo "📦 PROJECT     : $PROJECT_NAME"
echo "📄 ENV FILE    : $ENV_FILE"
echo "🧠 COMPOSE     : $OVERRIDE_COMPOSE"
echo ""
echo "============================================================"
echo ""

echo "🔄 Applying Legacy ENV Compatibility Bridge"
cp "$ENV_FILE" "$ENV_ROOT"
echo "$ENV_TYPE" > "$SCRIPT_DIR/.runtime-universe"
echo "$PROJECT_NAME" > "$SCRIPT_DIR/.runtime-project"

COMPOSE_CMD="docker compose -p $PROJECT_NAME --env-file $ENV_FILE -f $BASE_COMPOSE -f $OVERRIDE_COMPOSE"

cleanup_runtime() {
echo ""
echo "============================================================"
echo "🧹 RUNTIME EXCLUSIVITY"
echo "============================================================"
echo ""
echo "🎯 Requested Runtime : $PROJECT_NAME"
echo ""
for project in shin-local shin-stg shin-prod; do
if [ "$project" = "$PROJECT_NAME" ]; then
continue
fi
containers="$(docker ps -aq --filter "label=com.docker.compose.project=$project")"
if [ -n "$containers" ]; then
echo "🛑 Removing Runtime : $project"
docker rm -f $containers >/dev/null
echo "✅ Removed : $project"
fi
done
legacy_containers="$(docker ps -aq --filter "label=com.docker.compose.project=shin-vps")"
if [ -n "$legacy_containers" ]; then
echo "🛑 Removing Legacy Runtime : shin-vps"
docker rm -f $legacy_containers >/dev/null
echo "✅ Removed : shin-vps"
fi
echo ""
echo "✅ Runtime Exclusivity Complete"
echo ""
}

ensure_shared_proxy() {
echo ""
echo "============================================================"
echo "🌐 SHARED PROXY NETWORK"
echo "============================================================"
echo ""
if docker network inspect shared-proxy >/dev/null 2>&1; then
echo "✅ shared-proxy already exists"
else
echo "🌐 Creating shared-proxy"
docker network create shared-proxy >/dev/null
echo "✅ shared-proxy created"
fi
echo ""
}

if [ "$STATUS" = true ]; then
eval "$COMPOSE_CMD ps"
exit 0
fi

if [ "$SHELL_MODE" = true ]; then
eval "$COMPOSE_CMD exec $INPUT_SERVICE bash"
exit 0
fi

if [ "$EXEC_MODE" = true ]; then
eval "$COMPOSE_CMD exec $INPUT_SERVICE $EXEC_COMMAND"
exit 0
fi

if [ "$SHOW_LOGS" = true ]; then
eval "$COMPOSE_CMD logs $INPUT_SERVICE"
exit 0
fi

if [ "$FOLLOW_LOGS" = true ]; then
eval "$COMPOSE_CMD logs -f $INPUT_SERVICE"
exit 0
fi

if [ "$RESTART" = true ]; then
echo ""
echo "🔄 RESTARTING RUNTIME"
echo ""
eval "$COMPOSE_CMD restart"
exit 0
fi

if [ "$STOP" = true ]; then
echo ""
echo "🛑 STOPPING RUNTIME"
echo ""
eval "$COMPOSE_CMD stop"
exit 0
fi

if [ "$MODE" = "down" ]; then
echo ""
echo "🧹 SHUTTING DOWN RUNTIME"
echo ""
eval "$COMPOSE_CMD down --remove-orphans"
exit 0
fi

if [ "$PRUNE" = true ]; then
echo ""
echo "🧹 CLEANING DOCKER SYSTEM"
echo ""
docker system prune -af
docker builder prune -af
fi

cleanup_runtime
ensure_shared_proxy

BUILD_ARGS=""
if [ "$NO_CACHE" = true ]; then
BUILD_ARGS="--no-cache"
fi

echo ""
echo "============================================================"
echo "🧠 BUILD DJANGO"
echo "============================================================"
echo ""
eval "$COMPOSE_CMD build $BUILD_ARGS django-v3"

NEXT_SERVICES="next-bicstation-v3 next-bic-saving-v3 next-tiper-v3 next-avflash-v3"

echo ""
echo "============================================================"
echo "🎬 BUILD NEXT FRONTENDS"
echo "============================================================"
echo ""

if [ "$PARALLEL" = true ]; then
eval "$COMPOSE_CMD build $BUILD_ARGS --parallel $NEXT_SERVICES"
else
for service in $NEXT_SERVICES; do
echo ""
echo "🚀 BUILDING: $service"
echo ""
eval "$COMPOSE_CMD build $BUILD_ARGS $service"
done
fi

if [ "$MODE" = "build" ]; then
echo ""
echo "============================================================"
echo "✅ BUILD COMPLETE"
echo "============================================================"
echo ""
exit 0
fi

echo ""
echo "============================================================"
echo "🚀 START RUNTIME"
echo "============================================================"
echo ""
eval "$COMPOSE_CMD up -d --remove-orphans"

sleep 5

if [ "$MIGRATE" = true ]; then
echo ""
echo "⚙️ DJANGO MIGRATE"
echo ""
eval "$COMPOSE_CMD exec django-v3 python manage.py migrate --noinput"
fi

if [ "$COLLECTSTATIC" = true ]; then
echo ""
echo "📦 DJANGO COLLECTSTATIC"
echo ""
eval "$COMPOSE_CMD exec django-v3 python manage.py collectstatic --noinput"
fi

if [ "$RESET_DB" = true ]; then
echo ""
echo "⚠️ RESET DATABASE REQUESTED"
echo ""
echo "This operation is intentionally not automated."
echo "Database persistence remains protected."
echo ""
fi

echo ""
echo "============================================================"
echo "📡 FINAL RUNTIME STATUS"
echo "============================================================"
echo ""
eval "$COMPOSE_CMD ps"
echo ""
echo "============================================================"
echo "✅ SHIN CORE LINX RUNTIME READY"
echo "============================================================"
echo ""
echo "🌌 Universe : $ENV_TYPE"
echo "📦 Project  : $PROJECT_NAME"
echo ""
echo "============================================================"
echo ""