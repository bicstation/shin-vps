#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS v3 Next.js & AI 特化型・高速再構築スクリプト
# ------------------------------------------------------------------------------
# 最適化ポイント:
# 1. WordPress/MariaDB 関連ロジックの完全パージ（軽量化）
# 2. Django (Postgres) のマイグレーション & 管理者自動作成の強化
# 3. Next.js 4サイトの並列ビルド最適化
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# --- 1. 環境判定 ---
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]] || [[ "$CURRENT_USER" == "maya" ]]; then
    TARGET="prod"
else
    TARGET="home"
fi

# Dockerビルドの高速化設定
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# --- 2. 引数解析 ---
NO_CACHE=""
CLEAN_VOLUMES=""
RAW_SERVICES=""

for arg in "$@"; do
    case $arg in
        "--no-cache") NO_CACHE="--no-cache" ;;
        "-a"|"--all") CLEAN_VOLUMES="--volumes" ;;
        *) RAW_SERVICES="$RAW_SERVICES $arg" ;;
    esac
done

# サービス名のマッピング (v3特化版)
SERVICES=""
for s in $RAW_SERVICES; do
    case $s in
        "bicstation") SERVICES="$SERVICES next-bicstation-v3" ;;
        "tiper")       SERVICES="$SERVICES next-tiper-v3" ;;
        "saving")      SERVICES="$SERVICES next-bic-saving-v3" ;;
        "avflash")     SERVICES="$SERVICES next-avflash-v3" ;;
        "django")      SERVICES="$SERVICES django-v3" ;;
        "db")          SERVICES="$SERVICES postgres-db-v3" ;;
        *)             SERVICES="$SERVICES $s" ;;
    esac
done

# --- 3. 前処理 (ネットワーク & クリーンアップ) ---
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
EXTERNAL_NET="shared-proxy"

echo "🧹 [1/3] Cleaning up old containers..."
docker compose -f "$COMPOSE_FILE" down $CLEAN_VOLUMES --remove-orphans

# 外部ネットワークの強制再作成
if ! docker network inspect "$EXTERNAL_NET" >/dev/null 2>&1; then
    echo "🌐 Creating network: $EXTERNAL_NET"
    docker network create "$EXTERNAL_NET"
fi

# --- 4. 実行シーケンス ---
echo "📍 [2/3] Building and Starting Services... (Target: $TARGET)"
docker compose -f "$COMPOSE_FILE" build --pull $NO_CACHE $SERVICES
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans $SERVICES

# --- 5. Django/DB セットアップ (15秒待機) ---
echo "⏳ [3/3] Setting up Backend... (Wait 15s)"
sleep 15

get_env_val() {
    grep "^$1=" "$SCRIPT_DIR/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r'
}

PG_PASS=$(get_env_val "PGADMIN_PASSWORD")
PG_EMAIL=$(get_env_val "PGADMIN_EMAIL")

echo "📦 Django: Migrating Database..."
docker compose exec -T django-v3 python manage.py migrate --noinput 2>/dev/null

echo "👤 Django: Creating Superuser (maya)..."
docker compose exec -T django-v3 python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='maya').exists():
    User.objects.create_superuser('maya', '$PG_EMAIL', '$PG_PASS')
    print('✅ Superuser maya created.')
else:
    print('ℹ️ Superuser maya already exists.')
" 2>/dev/null

# --- 6. フィニッシュ ---
echo "---------------------------------------------------"
echo "🎉 SHIN-VPS v3 REBUILT SUCCESSFULLY! (Next.js & AI Mode)"
echo "---------------------------------------------------"
echo "🌐 Tiper:       http://tiper-host:8083"
echo "🌐 Bicstation:  http://bicstation-host:8083"
echo "🌐 Saving:      http://saving-host:8083"
echo "🌐 AV-Flash:    http://avflash-host:8083"
echo "⚙️  API Admin:   http://api-tiper-host:8083/admin"
echo "---------------------------------------------------"

docker compose -f "$COMPOSE_FILE" ps