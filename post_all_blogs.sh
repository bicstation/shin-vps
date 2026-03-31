#!/bin/bash
# ------------------------------------------------------------------------------
# /home/maya/shin-vps/scripts/post_all_blogs.sh
# C-PLAN: SUPREME FLEET COMMANDER - v4.5 (VPS PRODUCTION OPTIMIZED)
# ------------------------------------------------------------------------------
# /home/maya/shin-vps/post_all_blogs.sh

# 1. 引数チェック (livedoor, hatena, blogger 等)
if [[ "$1" == "--target" ]]; then
    TARGET_PF=$2
else
    TARGET_PF=$1
fi

if [[ -z "$TARGET_PF" ]]; then
    echo "❌ Error: ターゲットプラットフォームを指定してください。"
    echo "Usage: ./post_all_blogs.sh livedoor"
    exit 1
fi

# 2. 🛰️ 環境判別 & パス自動設定
HOSTNAME=$(hostname)
if [[ "$HOSTNAME" == "Marya" ]]; then
    PROJECT_ROOT="/home/maya/shin-dev/shin-vps"
    echo "💻 ローカル環境 (Marya) を検知。"
else
    PROJECT_ROOT="/home/maya/shin-vps"
    echo "☁️ VPS本番環境 ($HOSTNAME) を検知。"
fi

# 3. 本番コンテナ定義
TARGET_CONTAINER="django-v3"
COMMAND_NAME="ai_fleet_deployer"

# 4. パス・ログ設定
LOG_DIR="$PROJECT_ROOT/scripts/logs"
LOG_FILE="$LOG_DIR/fleet_exec_${TARGET_PF}.log"
LOCK_FILE="/tmp/fleet_${TARGET_PF}.lock"

mkdir -p "$LOG_DIR"

# 5. 🚀 多重起動チェック
if [ -f "$LOCK_FILE" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ ${TARGET_PF}部隊は作戦展開中のため、重複出撃を中止します。" | tee -a "$LOG_FILE"
    exit 1
fi

touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

# 6. 実行ディレクトリへ移動
cd "$PROJECT_ROOT" || { echo "❌ Error: $PROJECT_ROOT が見つかりません。"; exit 1; }

# 7. 💥 出撃シークエンス開始
{
    echo "============================================================"
    echo "--- 🚀 統合艦隊 [${TARGET_PF^^}] ターゲット哨戒開始 ---"
    echo "--- 艦隊司令部: $HOSTNAME | コンテナ: $TARGET_CONTAINER ---"
    echo "--- 作戦開始時刻: $(date '+%Y-%m-%d %H:%M:%S') ---"
    echo "============================================================"

    # CSVの 'project' カラムに記載されているラベルを指定
    PROJECTS=("tiper" "bicstation" "avflash" "saving")

    for PRJ in "${PROJECTS[@]}"; do
        echo "[$(date '+%H:%M:%S')] 📡 Project: [$PRJ] -> Platform: [$TARGET_PF] 展開中..."
        
        # 🛠️ 修正ポイント: docker exec に -T を付与し、非対話モード(Cron等)でも動作を安定化
        docker exec $TARGET_CONTAINER python manage.py $COMMAND_NAME --project "$PRJ" --platform "$TARGET_PF"
        
        # 8. ⏱️ クールダウン (プラットフォーム別にランダム待機)
        if [[ "$TARGET_PF" == "blogger" ]]; then
            # BloggerはAPI制限が厳しいため長めに待機 (40-80秒)
            SLEEP_TIME=$(( (RANDOM % 40) + 40 ))
        else
            # Livedoor/Hatena用 (20-40秒)
            SLEEP_TIME=$(( (RANDOM % 20) + 20 ))
        fi
        
        echo "⏳ フェーズ完了。クールダウン (${SLEEP_TIME}s)..."
        sleep $SLEEP_TIME
    done

    echo "------------------------------------------------------------"
    echo "--- 🏁 MISSION COMPLETE [${TARGET_PF^^}]: $(date '+%Y-%m-%d %H:%M:%S') ---"
    echo "============================================================"
} 2>&1 | tee -a "$LOG_FILE"