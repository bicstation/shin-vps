#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS 究極フルスペック再構築スクリプト (2026 最終統合版)
# ------------------------------------------------------------------------------
# 1. 自動ネットワーク復旧 (shared-proxy)
# 2. WP 5サイト DB自動生成 & Django 管理者(maya)自動作成
# 3. エイリアス変換 (wp-all, db, django等)
# 4. 【究極】リフレッシュ機能 (-R / --refresh) : イメージ・ボリューム・全消去
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# 💡 VPS・ローカル環境の判定
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]] || [[ "$CURRENT_USER" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    IS_VPS=true
    TARGET="prod"
else
    IS_VPS=false
    TARGET="home"
fi

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# 2. 変数初期化
NO_CACHE=""
CLEAN_ALL=false
REFRESH_MODE=false
WATCH_MODE=false
TAIL_LOGS=true
RAW_SERVICES=""

# ---------------------------------------------------------
# 🚨 3. ヘルプ & 引数解析
# ---------------------------------------------------------
show_help() {
    echo "Usage: ./rebuild.sh [SERVICE_KEYWORDS...] [OPTIONS]"
    echo "Options: -R (究極リフレッシュ), -a (データ削除), -w (Watch), -c (クリーンビルド)"
}

for arg in "$@"; do
    case $arg in
        "--no-cache") NO_CACHE="--no-cache" ;;
        "-c"|"--clean") CLEAN=true ;;
        "-a"|"--all") CLEAN_ALL=true ;;
        "-R"|"--refresh") REFRESH_MODE=true; CLEAN_ALL=true; NO_CACHE="--no-cache" ;;
        "-w"|"--watch") WATCH_MODE=true ;;
        "-n"|"--no-log") TAIL_LOGS=false ;;
        "--help"|"-h") show_help; exit 0 ;;
        *) RAW_SERVICES="$RAW_SERVICES $arg" ;;
    esac
done

# 🚀 サービス名のマッピング
SERVICES=""
for s in $RAW_SERVICES; do
    case $s in
        "bicstation") SERVICES="$SERVICES next-bicstation-v2" ;;
        "tiper")       SERVICES="$SERVICES next-tiper-v2" ;;
        "saving")      SERVICES="$SERVICES next-bic-saving-v2" ;;
        "avflash")     SERVICES="$SERVICES next-avflash-v2" ;;
        "django")      SERVICES="$SERVICES django-v2" ;;
        "db")          SERVICES="$SERVICES mariadb-v2 postgres-db-v2" ;;
        "wp-all")      SERVICES="$SERVICES wordpress-gen-v2 wordpress-saving-v2 wordpress-adult-v2 wordpress-avflash-v2 nginx-wp-v2" ;;
        *)             SERVICES="$SERVICES $s" ;;
    esac
done
SERVICES=$(echo "$SERVICES" | tr ' ' '\n' | sort -u | tr '\n' ' ')

# ---------------------------------------------------------
# 4. 前処理 (ネットワーク & ウォッチ)
# ---------------------------------------------------------
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
EXTERNAL_NET="shared-proxy"

if ! docker network inspect "$EXTERNAL_NET" >/dev/null 2>&1; then
    docker network create "$EXTERNAL_NET"
fi

if [ "$WATCH_MODE" = true ]; then
    [ "$IS_VPS" = true ] && { echo "❌ PROD WATCH FORBIDDEN"; exit 1; }
    nodemon --watch "$SCRIPT_DIR" -e ts,tsx,js,jsx,css,scss,json,html,py --delay 3 --exec "$0 $(echo "$@" | sed 's/-w//g' | sed 's/--watch//g')"
    exit 0
fi

# ---------------------------------------------------------
# 5. 実行シーケンス (停止 -> クリーン -> ビルド -> 起動)
# ---------------------------------------------------------
echo "📍 TARGET: $TARGET | SERVICES: ${SERVICES:-ALL}"

if [ "$REFRESH_MODE" = true ]; then
    echo "🔥 [ULTIMATE REFRESH] 全データを削除し、イメージを再ビルドします..."
    docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
    docker system prune -af --volumes 
    docker network create "$EXTERNAL_NET" 2>/dev/null
elif [ "$CLEAN_ALL" = true ]; then
    echo "🚨 [FULL CLEAN] ボリュームを削除してリセットします..."
    docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
else
    docker compose -f "$COMPOSE_FILE" stop $SERVICES
fi

docker compose -f "$COMPOSE_FILE" build --pull $NO_CACHE $SERVICES
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans $SERVICES

# ---------------------------------------------------------
# 6. 自動データセットアップ
# ---------------------------------------------------------
sleep 2
DB_PASS=$(grep WP_DB_ROOT_PASSWORD "$SCRIPT_DIR/.env" | cut -d '=' -f2)
docker compose exec -T mariadb-v2 mariadb -u root -p"$DB_PASS" -e "
CREATE DATABASE IF NOT EXISTS wp_gen; CREATE DATABASE IF NOT EXISTS wp_saving;
CREATE DATABASE IF NOT EXISTS wp_adult; CREATE DATABASE IF NOT EXISTS wp_avflash;
CREATE DATABASE IF NOT EXISTS wp_tiper; GRANT ALL PRIVILEGES ON *.* TO 'root'@'%'; FLUSH PRIVILEGES;
" 2>/dev/null

docker compose exec -T django-v2 python manage.py shell -c "
from django.contrib.auth import get_user_model; User = get_user_model();
if not User.objects.filter(username='maya').exists():
    User.objects.create_superuser('maya', 'admin@example.com', 'maya_pass')
" 2>/dev/null

# ---------------------------------------------------------
# 7. ログ出力
# ---------------------------------------------------------
echo "🎉 再構築完了！"
[ "$TAIL_LOGS" = true ] && docker compose -f "$COMPOSE_FILE" logs -f --tail=50 $SERVICES