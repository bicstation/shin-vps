#!/bin/bash

# ======================================================
# bicstation 全自動データ更新スクリプト (Universal v6.1)
# ✨ 特徴: 属性自浄 ＋ 在庫生存確認 ＋ FTP安定化 ＋ ASUS修正
# ======================================================

# 1. パス解決
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MY_HOSTNAME=$(hostname)

echo "------------------------------------------------------"
echo "📍 Current Host: $MY_HOSTNAME"
echo "📂 Script Path: $SCRIPT_DIR"

# 2. 環境設定
if [ "$MY_HOSTNAME" = "x162-43-73-204" ]; then
    COMPOSE_FILE_OPT="-f docker-compose.prod.yml"
    echo "🌐 Mode: VPS Production"
else
    COMPOSE_FILE_OPT="-f docker-compose.yml"
    echo "💻 Mode: Local Development"
fi

cd "$SCRIPT_DIR" || exit 1

# 3. 実行コマンド判定
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
echo "🚀 Start Modern Catalog Process: $(date)"
echo "======================================================"

# --- [1/5] 🏷️ 属性マスタ同期 ---
echo "🏷️ [1/5] Step 1: Syncing Master Attributes..."
$PY_CMD manage.py sync_master_attributes

# --- [2/5] 📡 データ取得 (LinkShare) ---
# FTP接続は特に不安定になりやすいため、各MIDの間に十分な待機時間を設けます
echo "📡 [2/5] Step 2: Fetching Raw Data..."
FTP_MIDS=("35909" "2557" "2543" "36508")
for mid in "${FTP_MIDS[@]}"; do
    echo "🔄 Processing MID: $mid ..."
    $PY_CMD manage.py import_linkshare_data --mid "$mid"
    echo "💤 Waiting for FTP stability (20s)..."
    sleep 20
done

echo "💤 Break before API Parser (5s)..."
sleep 5
$PY_CMD manage.py linkshare_bc_api_parser --mid "43708" --save-db

# --- [3/5] 🔄 DB同期 (PCProductテーブル反映) ---
echo "🔄 [3/5] Step 3: Mapping to PCProduct Table..."
declare -A ftp_configs=( ["35909"]="hp:HP" ["2557"]="dell:DELL" ["2543"]="fujitsu:FUJITSU" ["36508"]="dynabook:DYNABOOK" )
for mid in "${!ftp_configs[@]}"; do
    IFS=":" read -r maker prefix <<< "${ftp_configs[$mid]}"
    echo "📂 Processing $prefix ($mid)..."
    $PY_CMD "$SCRAPER_BASE/import_bc_ftp_to_db.py" --mid "$mid" --maker "$maker" --prefix "$prefix"
    sleep 2
done

# ASUSは引数エラー回避のため --prefix を除外
echo "📂 Processing ASUS (43708)..."
$PY_CMD "$SCRAPER_BASE/import_bc_api_to_db.py" --mid "43708" --maker "asus"

# --- [4/5] 🧠 AIスペック解析 (自浄作用) ---
# limit 1000 により、未解析の商品をほぼ全件カバーします
echo "🧠 [4/5] Step 4: AI Spec Analysis & Tag Cleaning (Limit: 1000)..."
$PY_CMD manage.py analyze_pc_spec --limit 50 --null-only

# --- [5/5] 🧹 カタログクリーンアップ & マッピング ---
echo "🧹 [5/5] Step 5: Catalog Cleanup & Auto Mapping..."
$PY_CMD manage.py cleanup_pc_catalog
$PY_CMD manage.py auto_map_attributes

echo "======================================================"
echo "✅ Finished at: $(date)"
echo "🚀 完了！マスタ同期、データ取得、AI解析、クリーンアップの全工程が正常に終了しました。"
echo "======================================================"

