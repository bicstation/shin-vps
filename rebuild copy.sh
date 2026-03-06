#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS 究極フルスペック再構築スクリプト (2026 最終統合版 - v3対応)
# ------------------------------------------------------------------------------
# 修正内容: 
# 1. 強制ネットワーク・デトックスロジック
# 2. DB作成結果のリアルタイム検証・可視化機能
# 3. v3サービス群の完全マッピング
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# --- 💡 ヘルプ機能 ---
show_help() {
    echo "Usage: ./$(basename "$0") [OPTIONS] [SERVICES]"
    echo ""
    echo "Options:"
    echo "  -h, --help       このヘルプを表示して終了"
    echo "  --no-cache       Dockerビルド時にキャッシュを使用しない"
    echo "  -c, --clean      既存のサービスを停止して再構築"
    echo "  -a, --all        ボリュームを含めてすべてリセット（初期化）"
    echo "  -R, --refresh    究極リフレッシュ（全イメージ・全ボリューム削除）"
    echo "  -w, --watch      [Home専用] nodemonによる自動再起動モード"
    echo "  -n, --no-log     実行後のログ表示をスキップ"
    echo ""
    echo "Services (Shortcuts):"
    echo "  db, django, tiper, bicstation, saving, avflash, wp-all"
    exit 0
}

# --- 1. 環境判定 ---
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]] || [[ "$CURRENT_USER" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    TARGET="prod"
else
    TARGET="home"
fi

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# --- 2. 変数初期化 ---
NO_CACHE=""
CLEAN_ALL=false
REFRESH_MODE=false
WATCH_MODE=false
TAIL_LOGS=true
RAW_SERVICES=""

# --- 🚨 3. 引数解析 ---
for arg in "$@"; do
    case $arg in
        "-h"|"--help")  show_help ;;
        "--no-cache")   NO_CACHE="--no-cache" ;;
        "-c"|"--clean") CLEAN=true ;;
        "-a"|"--all")   CLEAN_ALL=true ;;
        "-R"|"--refresh") REFRESH_MODE=true; CLEAN_ALL=true; NO_CACHE="--no-cache" ;;
        "-w"|"--watch") WATCH_MODE=true ;;
        "-n"|"--no-log") TAIL_LOGS=false ;;
        *) RAW_SERVICES="$RAW_SERVICES $arg" ;;
    esac
done

# 🚀 サービス名のマッピング (v3置換)
SERVICES=""
for s in $RAW_SERVICES; do
    case $s in
        "bicstation") SERVICES="$SERVICES next-bicstation-v3" ;;
        "tiper")       SERVICES="$SERVICES next-tiper-v3" ;;
        "saving")      SERVICES="$SERVICES next-bic-saving-v3" ;;
        "avflash")     SERVICES="$SERVICES next-avflash-v3" ;;
        "django")      SERVICES="$SERVICES django-v3" ;;
        "db")          SERVICES="$SERVICES mariadb-v3 postgres-db-v3" ;;
        "wp-all")      SERVICES="$SERVICES wordpress-gen-v3 wordpress-saving-v3 wordpress-adult-v3 wordpress-avflash-v3 nginx-wp-v3" ;;
        *)             SERVICES="$SERVICES $s" ;;
    esac
done
SERVICES=$(echo "$SERVICES" | tr ' ' '\n' | sort -u | tr '\n' ' ')

# --- 4. 前処理 (ネットワーク強制デトックス) ---
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
EXTERNAL_NET="shared-proxy"

echo "🧹 [1/3] Cleaning up old containers and network..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans >/dev/null 2>&1

if docker network inspect "$EXTERNAL_NET" >/dev/null 2>&1; then
    echo "♻️ Resetting network: $EXTERNAL_NET"
    for container in $(docker network inspect -f '{{range .Containers}}{{.Name}} {{end}}' "$EXTERNAL_NET"); do
        docker network disconnect -f "$EXTERNAL_NET" "$container" >/dev/null 2>&1
    done
    docker network rm "$EXTERNAL_NET" >/dev/null 2>&1
fi

docker network create "$EXTERNAL_NET"
echo "✅ Network $EXTERNAL_NET is clean and ready."

if [ "$WATCH_MODE" = true ]; then
    [ "$TARGET" = "prod" ] && { echo "❌ PROD WATCH FORBIDDEN"; exit 1; }
    nodemon --watch "$SCRIPT_DIR" -e ts,tsx,js,jsx,css,scss,json,html,py --delay 3 --exec "$0 $(echo "$@" | sed 's/-w//g')"
    exit 0
fi

# --- 5. 実行シーケンス ---
echo "📍 [2/3] Building and Starting Services... (Target: $TARGET)"

if [ "$REFRESH_MODE" = true ]; then
    echo "🔥 [ULTIMATE REFRESH] 全システムをパージ中..."
    docker system prune -af --volumes 
    docker network create "$EXTERNAL_NET" 2>/dev/null
elif [ "$CLEAN_ALL" = true ]; then
    echo "🚨 [FULL CLEAN] 全ボリュームをリセット中..."
    docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
    docker network create "$EXTERNAL_NET" 2>/dev/null
fi

docker compose -f "$COMPOSE_FILE" build --pull $NO_CACHE $SERVICES
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans $SERVICES

# --- 6. 自動データセットアップ ---
echo "⏳ [3/3] Setting up databases... (Wait 15s)"
sleep 15

get_env_val() {
    grep "^$1=" "$SCRIPT_DIR/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r'
}

WP_ROOT_PASS=$(get_env_val "WP_DB_ROOT_PASSWORD")
DB_GEN=$(get_env_val "WP_GEN_DB_NAME")
DB_SAVING=$(get_env_val "WP_SAVING_DB_NAME")
DB_ADULT=$(get_env_val "WP_ADULT_DB_NAME")
DB_AVFLASH=$(get_env_val "WP_AVFLASH_DB_NAME")
PG_PASS=$(get_env_val "PGADMIN_PASSWORD")
PG_EMAIL=$(get_env_val "PGADMIN_EMAIL")

echo "🗄️ MariaDB: WordPress用DB作成..."
docker compose exec -T mariadb-v3 mariadb -u root -p"$WP_ROOT_PASS" -e "
CREATE DATABASE IF NOT EXISTS \`${DB_GEN}\`;
CREATE DATABASE IF NOT EXISTS \`${DB_SAVING}\`;
CREATE DATABASE IF NOT EXISTS \`${DB_ADULT}\`;
CREATE DATABASE IF NOT EXISTS \`${DB_AVFLASH}\`;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;
" 2>/dev/null

echo "👤 Django: 管理者(maya)作成..."
docker compose exec -T django-v3 python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='maya').exists():
    User.objects.create_superuser('maya', '$PG_EMAIL', '$PG_PASS')
    print('✅ User maya created.')
else:
    print('ℹ️ User maya already exists.')
" 2>/dev/null

# --- 6.5 DB作成結果の検証 (Database Verification) ---
echo -e "\n🔍 Database Verification Check..."
EXISTING_DBS=$(docker compose exec -T mariadb-v3 mariadb -u root -p"$WP_ROOT_PASS" -e "SHOW DATABASES;" 2>/dev/null)

CHECK_DBS=("$DB_GEN" "$DB_SAVING" "$DB_ADULT" "$DB_AVFLASH")
DB_STATUS_OUTPUT=""

for db in "${CHECK_DBS[@]}"; do
    if echo "$EXISTING_DBS" | grep -q "^$db$"; then
        DB_STATUS_OUTPUT="${DB_STATUS_OUTPUT}  $(printf '%-20s' "$db") : ✅ [READY]\n"
    else
        DB_STATUS_OUTPUT="${DB_STATUS_OUTPUT}  $(printf '%-20s' "$db") : ❌ [MISSING]\n"
    fi
done

# --- 7. フィニッシュ ---
echo "---------------------------------------------------"
echo "🎉 再構築成功！ (Target: $TARGET)"
echo -e "🗄️ MariaDB Database Status:"
echo -e "$DB_STATUS_OUTPUT"
echo "---------------------------------------------------"
echo "🌐 API: http://api-tiper-host:8083"
echo "🐬 phpMyAdmin: http://phpmyadmin-host:8083"
echo "---------------------------------------------------"

if [ "$TAIL_LOGS" = true ]; then
    echo "📋 起動ログを5秒間表示します..."
    timeout 5s docker compose -f "$COMPOSE_FILE" logs -f --tail=20 $SERVICES
fi

echo -e "\n📊 現在のコンテナ稼働状況 (STATUSを確認してください):"
docker compose -f "$COMPOSE_FILE" ps

echo -e "\n✅ 全工程が完了しました。"