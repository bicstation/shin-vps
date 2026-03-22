#!/bin/bash
# /home/maya/shin-dev/shin-vps/scripts/post_all_blogs.sh

# --- 🛰️ 環境判別ロジック ---
HOSTNAME=$(hostname)
if [[ "$HOSTNAME" == "Marya" ]]; then
    PROJECT_ROOT="/home/maya/shin-dev/shin-vps"
    TARGET_CONTAINER="django-v3"
else
    PROJECT_ROOT="/home/maya/shin-vps"
    TARGET_CONTAINER="django-v3"
fi

# パス設定
LOG_DIR="$PROJECT_ROOT/scripts/logs"
LOG_FILE="$LOG_DIR/all_blogs_exec.log"
LOCK_FILE="/tmp/bicstation_fleet.lock"

# ログディレクトリ作成
mkdir -p "$LOG_DIR"

# --- 🚀 多重起動チェック ---
if [ -f "$LOCK_FILE" ]; then
    echo "[$(date '+%H:%M:%S')] ⚠️ 前の部隊が作戦展開中のため、中止します。" | tee -a "$LOG_FILE"
    exit 1
fi

touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

# 実行ディレクトリへ移動（docker-compose.ymlがある場所）
cd "$PROJECT_ROOT" || { echo "❌ Error: Cannot cd to $PROJECT_ROOT"; exit 1; }

# --- 💥 出撃シークエンス ---
echo "============================================================" | tee -a "$LOG_FILE"
echo "--- 🚀 BICSTATION 艦隊一斉出撃 ($HOSTNAME) ---" | tee -a "$LOG_FILE"
echo "--- 開始時刻: $(date '+%Y-%m-%d %H:%M:%S') ---" | tee -a "$LOG_FILE"

# 1. PCニュース系（bicstation）
echo "[PC News] 投稿開始..." | tee -a "$LOG_FILE"

# 💡 docker-compose exec ではなく docker exec を使うとより確実です
# docker exec $TARGET_CONTAINER python manage.py ai_fleet_deployer --project bicstation --platform livedoor >> "$LOG_FILE" 2>&1
# docker exec $TARGET_CONTAINER python manage.py ai_fleet_deployer --project bicstation --platform hatena >> "$LOG_FILE" 2>&1
# docker exec $TARGET_CONTAINER python manage.py ai_fleet_deployer --project bicstation --platform blogger >> "$LOG_FILE" 2>&1
# docker exec $TARGET_CONTAINER python manage.py ai_fleet_deployer --project bicstation >> "$LOG_FILE" 2>&1

# docker exec $TARGET_CONTAINER python manage.py ai_fleet_deployer --project tiper --platform livedoor >> "$LOG_FILE" 2>&1
docker exec $TARGET_CONTAINER python manage.py ai_fleet_deployer --project tiper >> "$LOG_FILE" 2>&1

# 待機
echo "⏳ クールダウン中 (30s)..." | tee -a "$LOG_FILE"
sleep 30

# 2. アダルトニュース系 (将来の拡張用)
# echo "[Adult News] 投稿開始..." | tee -a "$LOG_FILE"
# docker exec $TARGET_CONTAINER python manage.py ai_fleet_deployer --project adult >> "$LOG_FILE" 2>&1

echo "--- 🏁 全任務完了: $(date '+%Y-%m-%d %H:%M:%S') ---" | tee -a "$LOG_FILE"