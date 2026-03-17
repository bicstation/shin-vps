#!/bin/bash
# ==============================================================================
# 🚀 SHIN-VPS v3 HYBRID: 環境自動判別型・再構築スクリプト
# ------------------------------------------------------------------------------
# 職場PC (Local): docker-compose.yml / ポート 8083 / DEBUG=True
# VPS (Prod): docker-compose.prod.yml / SSL(443) / Traefik
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOSTNAME=$(hostname)

# --- 🛰️ 環境自動判別ロジック ---
if [[ "$HOSTNAME" == *"x162-43-73-204"* ]] || [[ -f "/etc/debian_version" && "$USER" == "maya" && ! -d "$HOME/dev" ]]; then
    # 【VPS 本番環境】
    ENV_TYPE="PROD"
    COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"
    EXTERNAL_NET="shin-vps_shared-proxy"
    SUFFIX="-v2" # 本番のサービス名接尾辞
    echo "🌐 [MODE] VPS Production detected."
else
    # 【職場PC / ローカル環境】
    ENV_TYPE="LOCAL"
    COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
    EXTERNAL_NET="shared-proxy"
    SUFFIX="-v3" # ローカルのサービス名接尾辞
    echo "💻 [MODE] Local Development detected."
fi

# --- 💡 ヘルプ表示 ---
show_help() {
    echo "Usage: ./rebuild.sh [OPTIONS] [SERVICES]"
    echo "Options: --no-cache, -l (logs), -a (all-reset: LOCAL only)"
    exit 0
}

# --- 1. 変数準備 ---
export DOCKER_BUILDKIT=1
NO_CACHE=""
CLEAN_VOLUMES=""
SHOW_LOGS=false
RAW_SERVICES=""

for arg in "$@"; do
    case $arg in
        "-h"|"--help")   show_help ;;
        "--no-cache")     NO_CACHE="--no-cache" ;;
        "-a"|"--all")     CLEAN_VOLUMES="true" ;;
        "-l"|"--logs")   SHOW_LOGS=true ;;
        *)               RAW_SERVICES="$RAW_SERVICES $arg" ;;
    esac
done

# --- 2. サービス名マッピング ( suffix を自動付与 ) ---
SERVICES=""
for s in $RAW_SERVICES; do
    case $s in
        "django")   SERVICES="$SERVICES django$SUFFIX" ;;
        "db")       SERVICES="$SERVICES postgres-db$SUFFIX" ;;
        "tiper")    SERVICES="$SERVICES next-tiper$SUFFIX" ;;
        "bic")      SERVICES="$SERVICES next-bicstation$SUFFIX" ;;
        "saving")   SERVICES="$SERVICES next-bic-saving$SUFFIX" ;;
        "avflash")  SERVICES="$SERVICES next-avflash$SUFFIX" ;;
        *)          SERVICES="$SERVICES $s" ;;
    esac
done

# --- 3. ネットワーク & 掃除 ---
if ! docker network inspect "$EXTERNAL_NET" >/dev/null 2>&1; then
    docker network create "$EXTERNAL_NET"
fi

if [ "$ENV_TYPE" == "LOCAL" ] && [ "$CLEAN_VOLUMES" == "true" ]; then
    echo "⚠️ [DANGER] Local Full Reset..."
    # ローカルの時だけ物理削除を許可 (安全装置)
    sudo rm -rf ./vps-data/postgres/*
fi

# --- 4. ビルド & 起動 ---
echo "📍 [Action] Building and Starting..."
docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans $NO_CACHE $SERVICES

# --- 5. Django セットアップ ---
echo "⏳ [Post-Process] Waiting for DB..."
sleep 10

get_env_val() {
    grep "^$1=" "$SCRIPT_DIR/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r'
}
PG_PASS=$(get_env_val "PGADMIN_PASSWORD")
PG_EMAIL=$(get_env_val "PGADMIN_EMAIL")
DJANGO_TARGET="django$SUFFIX"

echo "📦 Django: Migrating..."
docker compose -f "$COMPOSE_FILE" exec -T $DJANGO_TARGET python manage.py migrate --noinput

echo "👤 Django: Creating Superuser..."
docker compose -f "$COMPOSE_FILE" exec -T $DJANGO_TARGET python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='maya').exists():
    User.objects.create_superuser('maya', '$PG_EMAIL', '$PG_PASS')
"

# --- 6. 完了 ---
echo "---------------------------------------------------"
echo "🎉 SHIN-VPS v3 [$ENV_TYPE] REBUILT!"
echo "---------------------------------------------------"
docker compose -f "$COMPOSE_FILE" ps

if [ "$SHOW_LOGS" = true ]; then
    docker compose -f "$COMPOSE_FILE" logs -f --tail=50 $SERVICES
fi