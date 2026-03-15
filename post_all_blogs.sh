#!/bin/bash

# --- 🚀 パス自動判定セクション ---
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# プロジェクトルート（docker-compose.ymlがある場所）を指定
PROJECT_ROOT="$SCRIPT_DIR" 

LOG_DIR="$PROJECT_ROOT/django/api/management/commands/cron_logs"
LOG_FILE="$LOG_DIR/all_blogs_exec.log"

# --- 実行準備 ---
mkdir -p "$LOG_DIR"
cd "$PROJECT_ROOT" || exit 1

# ログに開始時刻を記録
{
    echo "------------------------------------------------------------"
    echo "--- 🚀 BICSTATION 艦隊一斉出撃: $(date '+%Y-%m-%d %H:%M:%S') ---"
    echo "Project Root: $PROJECT_ROOT"

    # PCニュース系
    echo "[PC News] 投稿開始..."
    docker compose exec -T django-v3 python manage.py ai_post_pc_news

    # Livedoorの連続投稿エラーを回避するための少し長めの待機
    echo "Waiting for cool down (30s)..."
    sleep 30

    # アダルトニュース系 (22サイト艦隊)
    echo "[Adult News] 投稿開始..."
    docker compose exec -T django-v3 python manage.py ai_post_adult_news --target all

    echo "--- 🏁 完了: $(date '+%Y-%m-%d %H:%M:%S') ---"
} >> "$LOG_FILE" 2>&1