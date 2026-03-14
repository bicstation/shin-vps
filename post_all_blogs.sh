#!/bin/bash

# --- 🚀 パス自動判定セクション ---
# スクリプト自身の場所を基準に、絶対パスを取得する魔法の1行
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

# ログディレクトリの設定（自動でパスが追従します）
LOG_DIR="$PROJECT_ROOT/django/api/management/commands/cron_logs"
LOG_FILE="$LOG_DIR/all_blogs_exec.log"

# Dockerコマンドのフルパスを自動取得
DOCKER_BIN=$(which docker || echo "/usr/bin/docker")

# --- 実行フェーズ ---
mkdir -p "$LOG_DIR"
cd "$PROJECT_ROOT" || exit 1

echo "------------------------------------------------------------" >> "$LOG_FILE"
echo "--- 🚀 BICSTATION 艦隊一斉出撃: $(date) ---" >> "$LOG_FILE"
echo "環境判定パス: $PROJECT_ROOT" >> "$LOG_FILE"

# PCニュース系 (v16.0)
echo "[PC News] 投稿開始..." >> "$LOG_FILE"
$DOCKER_BIN compose exec -T django-v3 python manage.py ai_post_pc_news >> "$LOG_FILE" 2>&1

# アダルトニュース系 (v17.4)
sleep 15
echo "[Adult News] 投稿開始..." >> "$LOG_FILE"
$DOCKER_BIN compose exec -T django-v3 python manage.py ai_post_adult_news --target all >> "$LOG_FILE" 2>&1

echo "--- 🏁 完了: $(date) ---" >> "$LOG_FILE"