#!/bin/bash
# ------------------------------------------------------------------------------
# /home/maya/shin-vps/scripts/post_all_blogs.sh
# C-PLAN: SUPREME FLEET COMMANDER - v4.1 HYBRID EDITION (Auto-Path Detection)
# ------------------------------------------------------------------------------

# 1. 引数チェック ($1 に livedoor, hatena, blogger 等を指定)
TARGET_PF=$1
if [[ -z "$TARGET_PF" ]]; then
    echo "❌ Error: ターゲットを指定してください。"
    echo "Usage: ./post_all_blogs.sh [livedoor|hatena|blogger]"
    exit 1
fi

# 2. 🛰️ 環境判別 & パス自動設定
HOSTNAME=$(hostname)
if [[ "$HOSTNAME" == "Marya" ]]; then
    # 💻 ローカル環境 (職場PC)
    PROJECT_ROOT="/home/maya/shin-dev/shin-vps"
    echo "💻 ローカル環境 (Marya) を検知しました。"
else
    # ☁️ VPS環境
    PROJECT_ROOT="/home/maya/shin-vps"
    echo "☁️ VPS環境 ($HOSTNAME) を検知しました。"
fi

# ターゲットコンテナ名とDjangoコマンド
TARGET_CONTAINER="django-v3"
COMMAND_NAME="ai_fleet_deployer"

# 3. パス・ログ設定
# ログディレクトリは scripts/logs 固定（PROJECT_ROOTからの相対パス）
LOG_DIR="$PROJECT_ROOT/scripts/logs"
LOG_FILE="$LOG_DIR/fleet_exec_${TARGET_PF}.log"
LOCK_FILE="/tmp/fleet_${TARGET_PF}.lock"

# ログディレクトリがない場合は作成
mkdir -p "$LOG_DIR"

# 4. 🚀 多重起動チェック
if [ -f "$LOCK_FILE" ]; then
    echo "[$(date '+%H:%M:%S')] ⚠️ ${TARGET_PF}部隊は既に作戦展開中です。重複出撃を中止します。" | tee -a "$LOG_FILE"
    exit 1
fi

touch "$LOCK_FILE"
# 終了時に必ずロックファイルを削除
trap 'rm -f "$LOCK_FILE"' EXIT

# 5. 実行ディレクトリへ移動
# ここで docker-compose.yml がある場所に移動するのが最重要です
cd "$PROJECT_ROOT" || { echo "❌ Error: $PROJECT_ROOT に移動できませんでした。"; exit 1; }

# 6. 💥 出撃シークエンス開始
{
    echo "============================================================"
    echo "--- 🚀 統合艦隊 [${TARGET_PF^^}] ターゲット哨戒開始 ---"
    echo "--- 作戦開始時刻: $(date '+%Y-%m-%d %H:%M:%S') ---"
    echo "--- 実行環境: $HOSTNAME / Path: $PROJECT_ROOT ---"
    echo "============================================================"

    # プロジェクトリスト
    PROJECTS=("bicstation" "tiper" "avflash" "saving")

    for PRJ in "${PROJECTS[@]}"; do
        echo "[$(date '+%H:%M:%S')] 📡 Project: [$PRJ] -> Target: [$TARGET_PF] 哨戒・展開中..."
        
        # docker exec で Django コマンドを実行
        # -T オプションを付けることで、cron等の非対話環境でも安定動作させます
        docker exec -T $TARGET_CONTAINER python manage.py $COMMAND_NAME --project "$PRJ" --target "$TARGET_PF"
        
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