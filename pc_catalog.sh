#!/bin/bash

# ======================================================
# bicstation 全自動データ更新スクリプト
# ======================================================

# 1. 環境判定
IS_DOCKER=false
if [ -f /.dockerenv ] || [ "$(docker ps -q -f name=django-v3)" ]; then
    IS_DOCKER=true
fi

# 2. コマンド定義
if [ "$IS_DOCKER" = true ]; then
    PY_CMD="docker compose exec -T django-v3 python3"
    SCRAPER_BASE="/usr/src/app/scrapers/src/shops"
else
    PY_CMD="python3"
    SCRAPER_BASE="$(pwd)/django/scrapers/src/shops"
fi

PROJECT_DIR="$HOME/shin-dev/shin-vps"
cd "$PROJECT_DIR" || exit

echo "======================================================"
echo "🚀 Start Process: $(date)"
echo "======================================================"

# --- [1/4] データインポート (FTP/API) ---
echo "📡 Fetching Raw Data..."
# FTP群
FTP_MIDS=("35909" "2557" "2543" "36508")
for mid in "${FTP_MIDS[@]}"; do
    $PY_CMD manage.py import_linkshare_data --mid "$mid"
done
# API群
$PY_CMD manage.py linkshare_bc_api_parser --mid "43708" --save-db

# --- [2/4] DB同期 (PCProduct反映) ---
echo "🔄 Synchronizing to PCProduct..."
# FTP同期
declare -A ftp_configs=( ["35909"]="hp:HP" ["2557"]="dell:DELL" ["2543"]="fujitsu:FUJITSU" ["36508"]="dynabook:DYNABOOK" )
for mid in "${!ftp_configs[@]}"; do
    IFS=":" read -r maker prefix <<< "${ftp_configs[$mid]}"
    $PY_CMD "$SCRAPER_BASE/import_bc_ftp_to_db.py" --mid "$mid" --maker "$maker" --prefix "$prefix"
done
# API同期
$PY_CMD "$SCRAPER_BASE/import_bc_api_to_db.py" --mid "43708" --maker "asus" --prefix "ASUS"

# --- [3/4] AIスペック解析 ---
echo "🧠 Analyzing Specs via AI (Limit: 50)..."
$PY_CMD manage.py analyze_pc_spec --limit 50 --null-only

# --- [4/4] 属性マスタ同期 & 自動マッピング (仕上げ) ---
echo "🏷️ Finalizing: Attribute Mapping..."

# A. 属性マスタTSVをDBへ同期
echo "   - Syncing Master Attributes..."
$PY_CMD manage.py sync_master_attributes

# B. 解析済みデータから属性タグを自動生成・紐付け
echo "   - Auto Mapping Attributes..."
$PY_CMD manage.py auto_map_attributes

echo "======================================================"
echo "✅ Finished at: $(date)"
echo "🚀 データは最新の属性タグと共に更新されました。"
echo "======================================================"