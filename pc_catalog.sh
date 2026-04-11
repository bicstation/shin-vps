#!/bin/bash

# ======================================================
# bicstation 全自動データ更新スクリプト (Universal v4.1)
# 🛡️ ホスト名判定 ＋ パス相対解決 ＋ VPS対応
# ======================================================

# 1. 自身のスクリプトがあるディレクトリを絶対パスで取得
# これにより、どこから実行しても「自分の場所」を起点にできる
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MY_HOSTNAME=$(hostname)

echo "📍 Current Host: $MY_HOSTNAME"
echo "📂 Script Location: $SCRIPT_DIR"

# 2. 環境ごとの設定
if [ "$MY_HOSTNAME" = "x162-43-73-204" ]; then
    # --- VPS (Production) ---
    COMPOSE_FILE_OPT="-f docker-compose.prod.yml"
    echo "🌐 VPS Mode (Production)"
else
    # --- 職場 / 自宅 (Development) ---
    COMPOSE_FILE_OPT="-f docker-compose.yml"
    echo "💻 Development Mode (Work/Home)"
fi

# 3. プロジェクトルートへ移動 (スクリプトの場所をルートと見なす)
cd "$SCRIPT_DIR" || exit 1

# 4. コマンド判定
if docker compose $COMPOSE_FILE_OPT ps --format "{{.Name}}" | grep -q "django-v3"; then
    PY_CMD="docker compose $COMPOSE_FILE_OPT exec -T django-v3 python3"
    SCRAPER_BASE="/usr/src/app/scrapers/src/shops"
    echo "🐳 Executing via Docker."
else
    PY_CMD="python3"
    # ローカル実行時は、スクリプトの場所からdjangoフォルダを探す
    SCRAPER_BASE="$SCRIPT_DIR/django/scrapers/src/shops"
    echo "🐍 Executing via Local Python."
fi

echo "======================================================"
echo "🚀 Start Process: $(date)"
echo "======================================================"

# --- [1/4] データインポート (FTP/API) ---
echo "📡 Fetching Raw Data..."
FTP_MIDS=("35909" "2557" "2543" "36508")
for mid in "${FTP_MIDS[@]}"; do
    $PY_CMD manage.py import_linkshare_data --mid "$mid"
done
$PY_CMD manage.py linkshare_bc_api_parser --mid "43708" --save-db

# --- [2/4] DB同期 (PCProduct反映) ---
echo "🔄 Synchronizing to PCProduct..."
declare -A ftp_configs=( ["35909"]="hp:HP" ["2557"]="dell:DELL" ["2543"]="fujitsu:FUJITSU" ["36508"]="dynabook:DYNABOOK" )
for mid in "${!ftp_configs[@]}"; do
    IFS=":" read -r maker prefix <<< "${ftp_configs[$mid]}"
    $PY_CMD "$SCRAPER_BASE/import_bc_ftp_to_db.py" --mid "$mid" --maker "$maker" --prefix "$prefix"
done
$PY_CMD "$SCRAPER_BASE/import_bc_api_to_db.py" --mid "43708" --maker "asus" --prefix "ASUS"

# --- [3/4] AIスペック解析 ---
echo "🧠 Analyzing Specs via AI (Limit: 50)..."
$PY_CMD manage.py analyze_pc_spec --limit 50 --null-only

# --- [4/4] 属性マスタ同期 & 自動マッピング ---
echo "🏷️ Finalizing: Attribute Mapping..."
$PY_CMD manage.py sync_master_attributes
$PY_CMD manage.py auto_map_attributes

echo "======================================================"
echo "✅ Finished at: $(date)"
echo "🚀 完了！どのPCからでもこのスクリプトが「基準」です。"
echo "======================================================"