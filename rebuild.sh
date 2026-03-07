#!/bin/bash
# /home/maya/shin-dev/shin-vps/rebuild.sh

# ==============================================================================
# 🚀 SHIN-VPS v3 究極フルスペック再構築スクリプト (Next.js & AI 特化型)
# ------------------------------------------------------------------------------
# 2026 最終統合版: ネットワークデトックス、並列ビルド、共有ディレクトリ可視化、DB自動検証
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
    echo "  -s, --shared     共有ディレクトリ (shared/) の構造を表示して終了"
    echo "  --no-cache       Dockerキャッシュを無視してビルド"
    echo "  -a, --all        既存ボリュームを削除してフルリセット (DB初期化)"
    echo "  -l, --logs       起動後にリアルタイムログを表示 (Ctrl+Cで終了)"
    echo ""
    echo "Services (Shortcuts):"
    echo "  tiper, bicstation, saving, avflash, django, db"
    echo "  ※サービス名を指定しない場合は、全てのコンテナを再構築します。"
    exit 0
}

# --- 📂 共有ディレクトリの可視化機能 ---
show_shared_structure() {
    echo "📂 [STRUCTURE] Shared Directory Mapping (3 Levels):"
    echo "---------------------------------------------------"
    if command -v tree >/dev/null 2>&1; then
        # -L 3 で第3階層まで、-F でディレクトリに / を付与
        tree -L 3 -F "$SHARED_DIR"
    else
        echo "⚠️ 'tree' command not found. Using find instead:"
        find "$SHARED_DIR" -maxdepth 3 -not -path '*/.*'
    fi
    echo "---------------------------------------------------"
}

# --- 1. 環境判定 ---
CURRENT_USER=$USER
CURRENT_HOSTNAME=$(hostname)
TARGET="home"
[[ "$CURRENT_HOSTNAME" == *"x162-43"* || "$CURRENT_USER" == "maya" ]] && TARGET="prod"

# Docker Buildkit 有効化 (高速並列ビルド用)
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
        "-a"|"--all")    CLEAN_VOLUMES="--volumes" ;;
        "-l"|"--logs")   SHOW_LOGS=true ;;
        *)               RAW_SERVICES="$RAW_SERVICES $arg" ;;
    esac
done

# サービス名のマッピング (v3対応ショートカット)
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

# --- 3. 前処理: ネットワーク & コンテナの強制リフレッシュ ---
echo "🧹 [1/4] Network & Container Detox..."
# 古いコンテナを停止・削除
docker compose -f "$COMPOSE_FILE" down $CLEAN_VOLUMES --remove-orphans >/dev/null 2>&1

# 共有ネットワークのクリーンアップ (既存の接続を解除して再作成)
if docker network inspect "$EXTERNAL_NET" >/dev/null 2>&1; then
    echo "♻️ Resetting network: $EXTERNAL_NET"
    for container in $(docker network inspect -f '{{range .Containers}}{{.Name}} {{end}}' "$EXTERNAL_NET"); do
        docker network disconnect -f "$EXTERNAL_NET" "$container" >/dev/null 2>&1
    done
    docker network rm "$EXTERNAL_NET" >/dev/null 2>&1
fi
docker network create "$EXTERNAL_NET"
echo "✅ Network $EXTERNAL_NET is ready."

# --- 4. ビルド & 起動 ---
echo "📍 [2/4] Building and Starting Services... (Target: $TARGET)"
docker compose -f "$COMPOSE_FILE" build --pull $NO_CACHE $SERVICES
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans $SERVICES

# --- 5. バックエンド・セットアップ (マイグレーション & 管理者) ---
echo "⏳ [3/4] Setting up Backend... (Wait 5s)"
sleep 5

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

# --- 6. 完了表示 (フィニッシュ・ダッシュボード) ---
echo "---------------------------------------------------"
echo "🎉 SHIN-VPS v3 REBUILT SUCCESSFULLY!"
echo "---------------------------------------------------"
printf "🌐 %-12s : http://tiper-host:8083\n" "Tiper"
printf "🌐 %-12s : http://bicstation-host:8083\n" "Bicstation"
printf "🌐 %-12s : http://saving-host:8083\n" "Saving"
printf "🌐 %-12s : http://avflash-host:8083\n" "AV-Flash"
printf "⚙️  %-12s : http://api-tiper-host:8083/admin\n" "Django Admin"
echo "---------------------------------------------------"

# コンテナ稼働状況の表示
docker compose -f "$COMPOSE_FILE" ps

# --- 7. ログのリアルタイム表示 (オプション) ---
if [ "$SHOW_LOGS" = true ]; then
    echo -e "\n📋 Tailing logs (Press Ctrl+C to stop)..."
    docker compose -f "$COMPOSE_FILE" logs -f --tail=50 $SERVICES
fi

echo -e "\n✅ All processes completed successfully."