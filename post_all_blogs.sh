#!/bin/bash
# /home/maya/shin-dev/shin-vps/scripts/post_all_blogs.sh
# BICSTATION & TIPER & OTHERS 艦隊一斉出撃用スクリプト

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
    echo "[$(date '+%H:%M:%S')] ⚠️ 前の部隊が作戦展開中のため、本日の出撃を中止します。" | tee -a "$LOG_FILE"
    exit 1
fi

touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

# 実行ディレクトリへ移動（docker-compose.ymlがある場所）
cd "$PROJECT_ROOT" || { echo "❌ Error: $PROJECT_ROOT に移動できませんでした。"; exit 1; }

# --- 💥 出撃シークエンス ---
echo "============================================================" | tee -a "$LOG_FILE"
echo "--- 🚀 BICSTATION 統合艦隊 一斉出撃 ($HOSTNAME) ---" | tee -a "$LOG_FILE"
echo "--- 開始時刻: $(date '+%Y-%m-%d %H:%M:%S') ---" | tee -a "$LOG_FILE"

# 1. PCニュース・ガジェット系（bicstation）
echo "[$(date '+%H:%M:%S')] 📘 [PC News: bicstation] 哨戒・投稿開始..." | tee -a "$LOG_FILE"
docker exec $TARGET_CONTAINER python manage.py ai_fleet_deployer --project bicstation >> "$LOG_FILE" 2>&1

# 待機（APIレート制限回避のためのクールダウン）
echo "⏳ クールダウン中 (20s)..." | tee -a "$LOG_FILE"
sleep 20

# 2. アダルトレビュー・ライブ系 (tiper)
echo "[$(date '+%H:%M:%S')] 📕 [Adult: tiper] 哨戒・投稿開始..." | tee -a "$LOG_FILE"
docker exec $TARGET_CONTAINER python manage.py ai_fleet_deployer --project tiper >> "$LOG_FILE" 2>&1

# # 待機
# echo "⏳ クールダウン中 (20s)..." | tee -a "$LOG_FILE"
# sleep 20

# # 3. 官能レビュー系 (avflash) - project_configs.jsonにある定義に基づき実行
# echo "[$(date '+%H:%M:%S')] 📙 [Adult: avflash] 哨戒・投稿開始..." | tee -a "$LOG_FILE"
# docker exec $TARGET_CONTAINER python manage.py ai_fleet_deployer --project avflash >> "$LOG_FILE" 2>&1

# 待機
# echo "⏳ クールダウン中 (20s)..." | tee -a "$LOG_FILE"
# sleep 20

# # 4. 節約・ポイ活系 (saving)
# echo "[$(date '+%H:%M:%S')] 📗 [Saving: saving] 哨戒・投稿開始..." | tee -a "$LOG_FILE"
# docker exec $TARGET_CONTAINER python manage.py ai_fleet_deployer --project saving >> "$LOG_FILE" 2>&1

echo "------------------------------------------------------------" | tee -a "$LOG_FILE"
echo "--- 🏁 全任務完了: $(date '+%Y-%m-%d %H:%M:%S') ---" | tee -a "$LOG_FILE"
echo "============================================================" | tee -a "$LOG_FILE"