#!/bin/bash
# ------------------------------------------------------------------------------
# /home/maya/shin-vps/scripts/post_all_blogs.sh
# C-PLAN: SUPREME FLEET COMMANDER - v4.2 HYBRID EDITION
# ------------------------------------------------------------------------------

# 1. 引数チェック (livedoor, hatena 等を直接指定、または --target livedoor に対応)
if [[ "$1" == "--target" ]]; then
    TARGET_PF=$2
else
    TARGET_PF=$1
fi

if [[ -z "$TARGET_PF" ]]; then
    echo "❌ Error: ターゲットを指定してください。"
    echo "Usage: ./post_all_blogs.sh livedoor"
    exit 1
fi

# 2. 🛰️ 環境判別 & パス自動設定
HOSTNAME=$(hostname)
if [[ "$HOSTNAME" == "Marya" ]]; then
    PROJECT_ROOT="/home/maya/shin-dev/shin-vps"
    echo "💻 ローカル環境 (Marya) を検知しました。"
else
    PROJECT_ROOT="/home/maya/shin-vps"
    echo "☁️ VPS環境 ($HOSTNAME) を検知しました。"
fi

TARGET_CONTAINER="django-v3"
COMMAND_NAME="ai_fleet_deployer"

# 3. パス・ログ設定
LOG_DIR="$PROJECT_ROOT/scripts/logs"
LOG_FILE="$LOG_DIR/fleet_exec_${TARGET_PF}.log"
LOCK_FILE="/tmp/fleet_${TARGET_PF}.lock"

mkdir -p "$LOG_DIR"

# 4. 🚀 多重起動チェック
if [ -f "$LOCK_FILE" ]; then
    echo "[$(date '+%H:%M:%S')] ⚠️ ${TARGET_PF}部隊は既に作戦展開中です。" | tee -a "$LOG_FILE"
    exit 1
fi

touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

# 5. 実行ディレクトリへ移動
cd "$PROJECT_ROOT" || { echo "❌ Error: $PROJECT_ROOT に移動できませんでした。"; exit 1; }

# 6. 💥 出撃シークエンス開始
{
    echo "============================================================"
    echo "--- 🚀 統合艦隊 [${TARGET_PF^^}] ターゲット哨戒開始 ---"
    echo "--- 作戦開始時刻: $(date '+%Y-%m-%d %H:%M:%S') ---"
    echo "============================================================"

    PROJECTS=("bicstation" "tiper" "avflash" "saving")

    for PRJ in "${PROJECTS[@]}"; do
        echo "[$(date '+%H:%M:%S')] 📡 Project: [$PRJ] -> Target: [$TARGET_PF] 哨戒・展開中..."
        
        # docker exec から -T を削除（環境依存エラー回避）
        docker exec $TARGET_CONTAINER python manage.py $COMMAND_NAME --project "$PRJ" --target "$TARGET_PF"
        
        # 7. ⏱️ クールダウン
        if [[ "$TARGET_PF" == "blogger" ]]; then
            SLEEP_TIME=$(( (RANDOM % 40) + 40 ))
        else
            SLEEP_TIME=$(( (RANDOM % 20) + 20 ))
        fi
        
        echo "⏳ クールダウン中 (${SLEEP_TIME}s)..."
        sleep $SLEEP_TIME
    done

    echo "------------------------------------------------------------"
    echo "--- 🏁 MISSION COMPLETE [${TARGET_PF^^}]: $(date '+%Y-%m-%d %H:%M:%S') ---"
    echo "============================================================"
} 2>&1 | tee -a "$LOG_FILE"