#!/bin/bash
# /home/maya/shin-vps/scripts/post_all_blogs.sh

# --- 🛰️ 環境判別ロジック ---
HOSTNAME=$(hostname)
if [[ "$HOSTNAME" == "Marya" ]]; then
    # ローカル環境（Marya）
    PROJECT_ROOT="/home/maya/shin-dev/shin-vps"
    TARGET_CONTAINER="django-v3"
else
    # VPS環境（x162-43-73-204）
    PROJECT_ROOT="/home/maya/shin-vps"
    TARGET_CONTAINER="django-v3"
fi

# パス設定（PROJECT_ROOTベースで統一）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_DIR="$PROJECT_ROOT/scripts/logs"
LOG_FILE="$LOG_DIR/all_blogs_exec.log"
LOCK_FILE="/tmp/bicstation_fleet.lock"

# --- 🚀 多重起動チェック ---
if [ -e "$LOCK_FILE" ]; then
    mkdir -p "$LOG_DIR"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ 前の部隊がまだ作戦展開中のため、出撃を中止します。" >> "$LOG_FILE"
    exit 1
fi

# ロックファイル作成（終了時に自動削除）
touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

# 実行ディレクトリへ移動
mkdir -p "$LOG_DIR"
cd "$PROJECT_ROOT" || { echo "Error: Cannot cd to $PROJECT_ROOT"; exit 1; }

# --- 💥 出撃シークエンス ---
{
    echo "============================================================"
    echo "--- 🚀 BICSTATION 艦隊一斉出撃 ($HOSTNAME) ---"
    echo "--- ターゲット: $TARGET_CONTAINER ---"
    echo "--- 開始時刻: $(date '+%Y-%m-%d %H:%M:%S') ---"

    # 1. PCニュース系
    echo "[PC News] 投稿開始..."
    docker compose exec -T $TARGET_CONTAINER python manage.py ai_post_pc_news

    echo "Waiting for cool down (30s)..."
    sleep 30

    # 2. アダルトニュース系 (20サイト艦隊)
    echo "[Adult News] 投稿開始..."
    docker compose exec -T $TARGET_CONTAINER python manage.py ai_post_adult_news

    echo "--- 🏁 完了: $(date '+%Y-%m-%d %H:%M:%S') ---"
} >> "$LOG_FILE" 2>&1