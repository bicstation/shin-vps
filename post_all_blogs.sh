#!/bin/bash
# /home/maya/shin-dev/shin-vps/post_all_blogs.sh

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR" 
LOG_DIR="$PROJECT_ROOT/django/api/management/commands/cron_logs"
LOG_FILE="$LOG_DIR/all_blogs_exec.log"
LOCK_FILE="/tmp/bicstation_fleet.lock" # 👈 ロックファイル

# --- 🛰️ 多重起動チェック ---
if [ -e "$LOCK_FILE" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ 前の部隊がまだ作戦展開中のため、出撃を中止します。" >> "$LOG_FILE"
    exit 1
fi

# ロックファイル作成（終わったら消す）
touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

# --- 実行準備 ---
mkdir -p "$LOG_DIR"
cd "$PROJECT_ROOT" || exit 1

# ログに開始時刻を記録
{
    echo "------------------------------------------------------------"
    echo "--- 🚀 BICSTATION 艦隊一斉出撃: $(date '+%Y-%m-%d %H:%M:%S') ---"

    # PCニュース系
    echo "[PC News] 投稿開始..."
    docker compose exec -T django-v3 python manage.py ai_post_pc_news

    echo "Waiting for cool down (30s)..."
    sleep 30

    # アダルトニュース系 (22サイト艦隊)
    echo "[Adult News] 投稿開始..."
    docker compose exec -T django-v3 python manage.py ai_post_adult_news --target all

    echo "--- 🏁 完了: $(date '+%Y-%m-%d %H:%M:%S') ---"
} >> "$LOG_FILE" 2>&1