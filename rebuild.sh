#!/bin/bash
# /home/maya/dev/shin-vps/rebuild.sh

# ==============================================================================
# 🚀 SHIN-VPS v3 究極フルスペック再構築スクリプト (自宅PC・パス修正済)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
EXTERNAL_NET="shared-proxy"
SHARED_DIR="$SCRIPT_DIR/shared"

# --- 💡 ヘルプ表示機能 ---
show_help() {
    echo "Usage: ./rebuild.sh [OPTIONS] [SERVICES]"
    echo ""
    echo "Options:"
    echo "  -h, --help       このヘルプを表示"
    echo "  -s, --shared     共有ディレクトリ (shared/) の構造を表示"
    echo "  --no-cache       Dockerキャッシュを無視してビルド"
    echo "  -a, --all        【破壊的】DB物理データを削除してフルリセット"
    echo "  -l, --logs       起動後にリアルタイムログを表示"
    exit 0
}

# --- 📂 共有ディレクトリの可視化 ---
show_shared_structure() {
    echo "📂 [STRUCTURE] Shared Directory Mapping:"
    if command -v tree >/dev/null 2>&1; then
        tree -L 3 -F "$SHARED_DIR"
    else
        find "$SHARED_DIR" -maxdepth 3 -not -path '*/.*'
    fi
}

# --- 1. 環境判定 ---
CURRENT_USER=$USER
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# --- 2. 引数解析 ---
NO_CACHE=""
CLEAN_VOLUMES=""
SHOW_LOGS=false
RAW_SERVICES=""

for arg in "$@"; do
    case $arg in
        "-h"|"--help")   show_help ;;
        "-s"|"--shared") show_shared_structure; exit 0 ;;
        "--no-cache")    NO_CACHE="--no-cache" ;;
        "-a"|"--all")    CLEAN_VOLUMES="true" ;;
        "-l"|"--logs")   SHOW_LOGS=true ;;
        *)               RAW_SERVICES="$RAW_SERVICES $arg" ;;
    esac
done

# サービス名のマッピング
SERVICES=""
for s in $RAW_SERVICES; do
    case $s in
        "tiper")       SERVICES="$SERVICES next-tiper-v3" ;;
        "bicstation")  SERVICES="$SERVICES next-bicstation-v3" ;;
        "saving")      SERVICES="$SERVICES next-bic-saving-v3" ;;
        "avflash")     SERVICES="$SERVICES next-avflash-v3" ;;
        "django")      SERVICES="$SERVICES django-v3" ;;
        "db")          SERVICES="$SERVICES postgres-db-v3" ;;
        *)             SERVICES="$SERVICES $s" ;;
    esac
done

# --- 3. 前処理: 物理リセット & ネットワークデトックス ---
echo "🧹 [1/4] Network & Container Detox..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans >/dev/null 2>&1

# 🔥 【重要】 -a オプション時の物理削除ロジック（パスを修正済み）
if [ "$CLEAN_VOLUMES" = "true" ]; then
    echo "⚠️ [DANGER] Full Reset: Deleting physical database data..."
    # 現在の更地ディレクトリにあわせて修正
    sudo rm -rf /home/maya/dev/vps-data/postgres/*
    echo "✅ Physical data cleared."
fi

if docker network inspect "$EXTERNAL_NET" >/dev/null 2>&1; then
    docker network rm "$EXTERNAL_NET" >/dev/null 2>&1
fi
docker network create "$EXTERNAL_NET"

# --- 4. ビルド & 起動 ---
echo "📍 [2/4] Building and Starting Services..."
docker compose -f "$COMPOSE_FILE" build --pull $NO_CACHE $SERVICES
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans $SERVICES

# --- 5. バックエンド・セットアップ ---
echo "⏳ [3/4] Setting up Backend... (Waiting for DB)"
sleep 15  # 自宅PCの負荷を考慮し、少し長めに待機

get_env_val() {
    grep "^$1=" "$SCRIPT_DIR/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r'
}
PG_PASS=$(get_env_val "PGADMIN_PASSWORD")
PG_EMAIL=$(get_env_val "PGADMIN_EMAIL")

echo "📦 Django: Migrating Database..."
docker compose exec -T django-v3 python manage.py migrate --noinput

echo "👤 Django: Checking Superuser (maya)..."
docker compose exec -T django-v3 python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='maya').exists():
    User.objects.create_superuser('maya', '$PG_EMAIL', '$PG_PASS')
    print('✅ Superuser maya created.')
"

# 🚀 Gateway Timeout対策: 表示フラグの自動一括更新
echo "⚡ Django: Enabling products for API display..."
docker compose exec -T django-v3 python manage.py shell -c "
try:
    from api.models import AdultProduct;
    updated = AdultProduct.objects.all().update(has_attributes=True, is_active=True);
    print(f'✅ {updated} products activated for API.');
except Exception as e:
    print(f'❌ Activation skipped (no table yet): {e}')
"

# --- 6. 完了表示 ---
echo "---------------------------------------------------"
echo "🎉 SHIN-VPS v3 REBUILT SUCCESSFULLY!"
echo "---------------------------------------------------"
printf "⚙️  %-12s : http://api-tiper-host:8083/admin\n" "Django Admin"
echo "---------------------------------------------------"
docker compose -f "$COMPOSE_FILE" ps

if [ "$SHOW_LOGS" = true ]; then
    docker compose -f "$COMPOSE_FILE" logs -f --tail=50 $SERVICES
fi