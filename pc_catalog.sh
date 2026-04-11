#!/bin/bash

# ======================================================
# bicstation 全自動データ更新スクリプト (Universal v4.2)
# 🛡️ ホスト名判定 ＋ パス相対解決 ＋ FTP安定化対策
# ======================================================

# 1. 自身のスクリプトがあるディレクトリを絶対パスで取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MY_HOSTNAME=$(hostname)

echo "------------------------------------------------------"
echo "📍 Current Host: $MY_HOSTNAME"
echo "📂 Script Path: $SCRIPT_DIR"

# 2. 環境ごとの設定（ホスト名でVPSを特定）
if [ "$MY_HOSTNAME" = "x162-43-73-204" ]; then
    # --- VPS (Production) ---
    COMPOSE_FILE_OPT="-f docker-compose.prod.yml"
    echo "🌐 Mode: VPS Production"
else
    # --- 職場 / 自宅 (Development) ---
    COMPOSE_FILE_OPT="-f docker-compose.yml"
    echo "💻 Mode: Local Development"
fi

# 3. プロジェクトルートへ移動
cd "$SCRIPT_DIR" || { echo "❌ Failed to enter directory"; exit 1; }

# 4. コマンド判定（Dockerコンテナが稼働中か確認）
# ログがうるさい場合は 2>/dev/null を追加
if docker compose $COMPOSE_FILE_OPT ps --format "{{.Name}}" | grep -q "django-v3"; then
    PY_CMD="docker compose $COMPOSE_FILE_OPT exec -T django-v3 python3"
    SCRAPER_BASE="/usr/src/app/scrapers/src/shops"
    echo "🐳 Execution: Docker Container"
else
    PY_CMD="python3"
    SCRAPER_BASE="$SCRIPT_DIR/django/scrapers/src/shops"
    echo "🐍 Execution: Local Python"
fi

echo "======================================================"
echo "🚀 Start Process: $(date)"
echo "======================================================"

# --- [1/4] データインポート (FTP/API) ---
echo "📡 [1/4] Fetching Raw Data from LinkShare..."
FTP_MIDS=("35909" "2557" "2543" "36508")
for mid in "${FTP_MIDS[@]}"; do
    echo "🔄 Processing MID: $mid ..."
    $PY_CMD manage.py import_linkshare_data --mid "$mid"
    
    # FTP 550エラー（連続接続拒否）対策として3秒待機
    echo "💤 Waiting for stability (3s)..."
    sleep 3
done

echo "🔄 Processing API MID: 43708 (ASUS) ..."
$PY_CMD manage.py linkshare_bc_api_parser --mid "43708" --save-db

# --- [2/4] DB同期 (PCProduct反映) ---
echo "🔄 [2/4] Synchronizing to PCProduct Table..."
declare -A ftp_configs=( ["35909"]="hp:HP" ["2557"]="dell:DELL" ["2543"]="fujitsu:FUJITSU" ["36508"]="dynabook:DYNABOOK" )
for mid in "${!ftp_configs[@]}"; do
    IFS=":" read -r maker prefix <<< "${ftp_configs[$mid]}"
    echo "📂 Mapping $prefix (MID: $mid) ..."
    $PY_CMD "$SCRAPER_BASE/import_bc_ftp_to_db.py" --mid "$mid" --maker "$maker" --prefix "$prefix"
done

echo "📂 Mapping ASUS (API) ..."
$PY_CMD "$SCRAPER_BASE/import_bc_api_to_db.py" --mid "43708" --maker "asus" --prefix "ASUS"

# --- [3/4] AIスペック解析 ---
echo "🧠 [3/4] Analyzing Specs via AI (Limit: 50)..."
# ここで v3.8 の ai_summary / ai_content 分離ロジックが走ります
$PY_CMD manage.py analyze_pc_spec --limit 50 --null-only

# --- [4/4] 属性マスタ同期 & 自動マッピング ---
echo "🏷️ [4/4] Finalizing: Attribute Mapping..."

echo "   - Syncing Master Attributes TSV..."
$PY_CMD manage.py sync_master_attributes

echo "   - Running Auto Mapping Logic..."
$PY_CMD manage.py auto_map_attributes

echo "======================================================"
echo "✅ Finished at: $(date)"
echo "🚀 完了！データと属性タグが最新状態に更新されました。"
echo "======================================================"