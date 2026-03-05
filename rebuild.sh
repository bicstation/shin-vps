#!/bin/bash

# ==============================================================================
# 🚀 SHIN-VPS 究極フルスペック再構築スクリプト (2026 最終統合版 - v3対応)
# ------------------------------------------------------------------------------
# 1. 自動ネットワーク復旧 (shared-proxy)
# 2. .env連動型 DB自動生成 (WordPress 4サイト分)
# 3. Django 管理者(maya)自動作成 & ロックエラー対策
# 4. 実行後、ログ確認 -> プロセス表示 -> 自動終了
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOSTNAME=$(hostname)
CURRENT_USER=$USER

# 1. 環境判定
if [[ "$CURRENT_HOSTNAME" == *"x162-43"* ]] || [[ "$CURRENT_HOSTNAME" == "maya" ]] || [[ "$CURRENT_USER" == "maya" && "$CURRENT_HOSTNAME" != "Marya" ]]; then
    TARGET="prod"
else
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
# 🚨 3. 引数解析
# ---------------------------------------------------------
for arg in "$@"; do
    case $arg in
        "--no-cache") NO_CACHE="--no-cache" ;;
        "-c"|"--clean") CLEAN=true ;;
        "-a"|"--all") CLEAN_ALL=true ;;
        "-R"|"--refresh") REFRESH_MODE=true; CLEAN_ALL=true; NO_CACHE="--no-cache" ;;
        "-w"|"--watch") WATCH_MODE=true ;;
        "-n"|"--no-log") TAIL_LOGS=false ;;
        *) RAW_SERVICES="$RAW_SERVICES $arg" ;;
    esac
done

# 🚀 サービス名のマッピング (v2 -> v3 に全置換)
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

# ---------------------------------------------------------
# 4. 前処理 (ネットワーク)
# ---------------------------------------------------------
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
EXTERNAL_NET="shared-proxy"

if ! docker network inspect "$EXTERNAL_NET" >/dev/null 2>&1; then
    echo "🌐 Creating network: $EXTERNAL_NET"
    docker network create "$EXTERNAL_NET"
fi

if [ "$WATCH_MODE" = true ]; then
    [ "$TARGET" = "prod" ] && { echo "❌ PROD WATCH FORBIDDEN"; exit 1; }
    nodemon --watch "$SCRIPT_DIR" -e ts,tsx,js,jsx,css,scss,json,html,py --delay 3 --exec "$0 $(echo "$@" | sed 's/-w//g')"
    exit 0
fi

# ---------------------------------------------------------
# 5. 実行シーケンス (ロック対策強化)
# ---------------------------------------------------------
echo "📍 TARGET: $TARGET | SERVICES: ${SERVICES:-ALL (Full Stack)}"

if [ "$REFRESH_MODE" = true ]; then
    echo "🔥 [ULTIMATE REFRESH] 全データを削除し、再構築します..."
    docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
    docker system prune -af --volumes 
    docker network create "$EXTERNAL_NET" 2>/dev/null
elif [ "$CLEAN_ALL" = true ]; then
    echo "🚨 [FULL CLEAN] ボリュームをリセットします..."
    docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
else
    # 既存プロセスの完全停止を待つ
    docker compose -f "$COMPOSE_FILE" stop $SERVICES
    sleep 2
fi

docker compose -f "$COMPOSE_FILE" build --pull $NO_CACHE $SERVICES
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans $SERVICES

# ---------------------------------------------------------
# 6. 自動データセットアップ (.env連動)
# ---------------------------------------------------------
echo "⏳ DBの完全起動を待機中 (15秒)..."
sleep 15

get_env_val() {
    grep "^$1=" "$SCRIPT_DIR/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'"
}

WP_ROOT_PASS=$(get_env_val "WP_DB_ROOT_PASSWORD")
DB_GEN=$(get_env_val "WP_GEN_DB_NAME")
DB_SAVING=$(get_env_val "WP_SAVING_DB_NAME")
DB_ADULT=$(get_env_val "WP_ADULT_DB_NAME")
DB_AVFLASH=$(get_env_val "WP_AVFLASH_DB_NAME")
PG_PASS=$(get_env_val "PGADMIN_PASSWORD")
PG_EMAIL=$(get_env_val "PGADMIN_EMAIL")

echo "🗄️ MariaDB: データベース作成..."
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
" 2>/dev/null

# ---------------------------------------------------------
# 7. ログ出力 & プロセス確認 (Finish)
# ---------------------------------------------------------
echo "---------------------------------------------------"
echo "🎉 再構築完了！"
echo "🌐 API: http://api-tiper-host:8083"
echo "🐬 phpMyAdmin: http://phpmyadmin-host:8083"
echo "---------------------------------------------------"

if [ "$TAIL_LOGS" = true ]; then
    echo "📋 起動ログを表示します (5秒後に自動でプロセス一覧へ切替)..."
    # ログを5秒間だけ流して自動終了させる
    timeout 5s docker compose -f "$COMPOSE_FILE" logs -f --tail=20 $SERVICES
fi

echo -e "\n📊 現在のコンテナ稼働状況:"
docker compose -f "$COMPOSE_FILE" ps

echo -e "\n✅ すべての処理が終了しました。プロンプトに戻ります。"