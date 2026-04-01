#!/bin/bash
# ------------------------------------------------------------------------------
# /home/maya/shin-vps/post_all_blogs.sh
# C-PLAN: SUPREME FLEET COMMANDER - v4.6.0 (Indexing Quota Optimization)
# ------------------------------------------------------------------------------

# 1. 引数チェック (livedoor, hatena, blogger 等)
TARGET_PF=$1
if [[ "$1" == "--target" ]]; then
    TARGET_PF=$2
fi

# スペルミス対策 (livewdoor 等を livedoor に正規化)
if [[ "$TARGET_PF" == "livewdoor" ]]; then
    TARGET_PF="livedoor"
fi

if [[ -z "$TARGET_PF" ]]; then
    echo "❌ Error: ターゲットプラットフォームを指定してください。"
    echo "Usage: ./post_all_blogs.sh livedoor"
    exit 1
fi

# 2. 🛰️ 環境判別 & 設定読み込み
if [ -f "./.env" ]; then
    export $(grep '^CMD_NAME=' "./.env" | xargs)
fi

DISPLAY_NAME=${CMD_NAME:-$(hostname)}

if [ -d "/home/maya/shin-vps" ]; then
    PROJECT_ROOT="/home/maya/shin-vps"
else
    PROJECT_ROOT="/home/maya/shin-dev/shin-vps"
fi

# 3. 💥 重要：新旗艦コマンドの定義
TARGET_CONTAINER="django-v3"
COMMAND_NAME="ai_fleet"

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

# 7. ⚖️ サチコ通報（Indexing API）の弾薬節約判定
# 現在の「時(0-23)」を取得
CURRENT_HOUR=$(date +%H | sed 's/^0//') # 08時を8として扱う
INDEX_FLAG=""

# 【戦略設定】サチコ連絡を許可する時間帯 (1日2回、メイン投稿に合わせて調整)
# 例: 9時台と21時台の投稿のみ --index を付与する
INDEX_HOURS=(9 21)

for HOUR in "${INDEX_HOURS[@]}"; do
    if [ "$CURRENT_HOUR" -eq "$HOUR" ]; then
        INDEX_FLAG="--index"
        break
    fi
done

# 8. 💥 出撃シークエンス開始
{
    echo "============================================================"
    echo "--- 🚀 統合艦隊 [${TARGET_PF^^}] ターゲット哨戒開始 ---"
    echo "--- 艦隊司令部: $DISPLAY_NAME | コンテナ: $TARGET_CONTAINER ---"
    echo "--- インデックス通報: $([[ -n "$INDEX_FLAG" ]] && echo "ENABLED (Quota Priority)" || echo "DISABLED (Natural Crawl)") ---"
    echo "--- 作戦開始時刻: $(date '+%Y-%m-%d %H:%M:%S') ---"
    echo "============================================================"

    # CSVの 'project' カラムに記載されている正式なラベル
    PROJECTS=("tiper" "avflash" "bicstation" "saving")

    for PRJ in "${PROJECTS[@]}"; do
        echo "[$(date '+%H:%M:%S')] 📡 Project: [$PRJ] -> Platform: [$TARGET_PF] 展開中..."
        
        # 🛠️ 実行コマンド
        # --limit 1 は各プロジェクトの全サイトに対して1記事ずつ投稿
        docker exec $TARGET_CONTAINER python manage.py $COMMAND_NAME \
            --project "$PRJ" \
            --platform "$TARGET_PF" \
            --limit 1 \
            $INDEX_FLAG
        
        # 9. ⏱️ クールダウン (20-40秒のランダム待機でBot検知を回避)
        SLEEP_TIME=$(( (RANDOM % 20) + 20 ))
        
        echo "⏳ フェーズ完了。クールダウン (${SLEEP_TIME}s)..."
        sleep $SLEEP_TIME
    done

    echo "------------------------------------------------------------"
    echo "--- 🏁 MISSION COMPLETE [${TARGET_PF^^}]: $(date '+%Y-%m-%d %H:%M:%S') ---"
    echo "============================================================"
} 2>&1 | tee -a "$LOG_FILE"