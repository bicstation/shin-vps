#!/bin/bash
# /home/maya/shin-vps/scripts/post_all_blogs.sh
# ------------------------------------------------------------------------------
# C-PLAN: MULTI-PLATFORM FLEET COMMANDER (Targeted Strategy Version)
# ------------------------------------------------------------------------------

# 引数チェック ($1 に livedoor, hatena, blogger 等を指定)
TARGET_PF=$1
if [[ -z "$TARGET_PF" ]]; then
    echo "❌ Error: ターゲット（livedoor, hatena, blogger）を指定してください。"
    exit 1
fi

# --- 🛰️ 環境判別ロジック ---
HOSTNAME=$(hostname)
if [[ "$HOSTNAME" == "Marya" ]]; then
    PROJECT_ROOT="/home/maya/shin-dev/shin-vps"
else
    PROJECT_ROOT="/home/maya/shin-vps"
fi
TARGET_CONTAINER="django-v3"

# パス・ログ設定（ターゲット別にログを分離）
LOG_DIR="$PROJECT_ROOT/scripts/logs"
LOG_FILE="$LOG_DIR/fleet_exec_${TARGET_PF}.log"
LOCK_FILE="/tmp/fleet_${TARGET_PF}.lock"

mkdir -p "$LOG_DIR"

# --- 🚀 多重起動チェック ---
if [ -f "$LOCK_FILE" ]; then
    echo "[$(date '+%H:%M:%S')] ⚠️ ${TARGET_PF}部隊はまだ作戦展開中です。出撃を中止します。" | tee -a "$LOG_FILE"
    exit 1
fi

touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

# 実行ディレクトリへ移動
cd "$PROJECT_ROOT" || { echo "❌ Error: $PROJECT_ROOT に移動できませんでした。"; exit 1; }

# --- 💥 出撃シークエンス ---
echo "============================================================" | tee -a "$LOG_FILE"
echo "--- 🚀 統合艦隊 [${TARGET_PF^^}] ターゲット哨戒開始 ---" | tee -a "$LOG_FILE"
echo "--- 作戦開始時刻: $(date '+%Y-%m-%d %H:%M:%S') ---" | tee -a "$LOG_FILE"
echo "============================================================" | tee -a "$LOG_FILE"

# Djangoコマンド名
COMMAND_NAME="fleet_deploy"

# プロジェクトリスト（全4種）
PROJECTS=("bicstation" "tiper" "avflash" "saving")

for PRJ in "${PROJECTS[@]}"; do
    echo "[$(date '+%H:%M:%S')] 📡 Project: [$PRJ] -> Target: [$TARGET_PF] 哨戒中..." | tee -a "$LOG_FILE"
    
    # --project と --target を両方指定してピンポイント爆撃
    docker exec $TARGET_CONTAINER python manage.py $COMMAND_NAME --project "$PRJ" --target "$TARGET_PF" >> "$LOG_FILE" 2>&1
    
    # プロジェクト間のクールダウン（APIレート制限とスパム判定回避）
    # Bloggerの場合は特に長めに取る（40-80秒）、それ以外は20-40秒
    if [[ "$TARGET_PF" == "blogger" ]]; then
        SLEEP_TIME=$(( (RANDOM % 40) + 40 ))
    else
        SLEEP_TIME=$(( (RANDOM % 20) + 20 ))
    fi
    
    echo "⏳ クールダウン中 (${SLEEP_TIME}s)..." | tee -a "$LOG_FILE"
    sleep $SLEEP_TIME
done

echo "------------------------------------------------------------" | tee -a "$LOG_FILE"
echo "--- 🏁 MISSION COMPLETE [${TARGET_PF^^}]: $(date '+%Y-%m-%d %H:%M:%S') ---" | tee -a "$LOG_FILE"
echo "============================================================" | tee -a "$LOG_FILE"