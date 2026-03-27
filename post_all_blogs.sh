#!/bin/bash
# ------------------------------------------------------------------------------
# /home/maya/shin-vps/scripts/post_all_blogs.sh
# C-PLAN: SUPREME FLEET COMMANDER - v4.0 HYBRID EDITION
# ------------------------------------------------------------------------------

# 1. 引数チェック ($1 に livedoor, hatena, blogger 等を指定)
TARGET_PF=$1
if [[ -z "$TARGET_PF" ]]; then
    echo "❌ Error: ターゲットを指定してください。"
    echo "Usage: ./post_all_blogs.sh [livedoor|hatena|blogger]"
    exit 1
fi

# 2. 🛰️ 環境判別 & パス自動設定
# ローカル(Marya)か、VPS(x162-43-73-204)かを判定してプロジェクトルートを切り替え
HOSTNAME=$(hostname)
if [[ "$HOSTNAME" == "Marya" ]]; then
    PROJECT_ROOT="/home/maya/shin-dev/shin-vps"
    echo "💻 ローカル環境 (Marya) を検知しました。"
else
    PROJECT_ROOT="/home/maya/shin-vps"
    echo "☁️ VPS環境 ($HOSTNAME) を検知しました。"
fi

TARGET_CONTAINER="django-v3"
# 修正の核心: ファイル名 ai_fleet_deployer.py に対応するコマンド名
COMMAND_NAME="ai_fleet_deployer"

# 3. パス・ログ設定（ターゲット別にログを分離）
LOG_DIR="$PROJECT_ROOT/scripts/logs"
LOG_FILE="$LOG_DIR/fleet_exec_${TARGET_PF}.log"
LOCK_FILE="/tmp/fleet_${TARGET_PF}.lock"

mkdir -p "$LOG_DIR"

# 4. 🚀 多重起動チェック（同一プラットフォームの同時出撃を防止）
if [ -f "$LOCK_FILE" ]; then
    echo "[$(date '+%H:%M:%S')] ⚠️ ${TARGET_PF}部隊は既に作戦展開中です。重複出撃を中止します。" | tee -a "$LOG_FILE"
    exit 1
fi

touch "$LOCK_FILE"
# 終了時に必ずロックファイルを削除
trap 'rm -f "$LOCK_FILE"' EXIT

# 5. 実行ディレクトリへ移動
cd "$PROJECT_ROOT" || { echo "❌ Error: $PROJECT_ROOT に移動できませんでした。"; exit 1; }

# 6. 💥 出撃シークエンス開始
echo "============================================================" | tee -a "$LOG_FILE"
echo "--- 🚀 統合艦隊 [${TARGET_PF^^}] ターゲット哨戒開始 ---" | tee -a "$LOG_FILE"
echo "--- 作戦開始時刻: $(date '+%Y-%m-%d %H:%M:%S') ---" | tee -a "$LOG_FILE"
echo "============================================================" | tee -a "$LOG_FILE"

# プロジェクトリスト（全4種）
PROJECTS=("bicstation" "tiper" "avflash" "saving")

for PRJ in "${PROJECTS[@]}"; do
    echo "[$(date '+%H:%M:%S')] 📡 Project: [$PRJ] -> Target: [$TARGET_PF] 哨戒・展開中..." | tee -a "$LOG_FILE"
    
    # 【重要】docker exec で Django コマンドを実行
    # 2>&1 を付けることで、エラーメッセージも全てログファイルに記録します。
    docker exec $TARGET_CONTAINER python manage.py $COMMAND_NAME --project "$PRJ" --target "$TARGET_PF" >> "$LOG_FILE" 2>&1
    
    # 7. ⏱️ クールダウン（APIレート制限とスパム判定回避）
    # BloggerはGoogleの監視が厳しいため長め(40-80s)、それ以外は(20-40s)
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