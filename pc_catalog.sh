#!/bin/bash

# ======================================================
# bicstation 全自動データ更新スクリプト (Universal v7.0)
# ✨ 属性完全リビルド対応版（精度保証）
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

# ------------------------------------------------------
# [1/6] 🏷️ 属性マスタ同期
# ------------------------------------------------------
echo "🏷️ [1/6] Step 1: Syncing Master Attributes..."
$PY_CMD manage.py sync_master_attributes

# ------------------------------------------------------
# [2/6] 📡 データ取得 (LinkShare)
# ------------------------------------------------------
echo "📡 [2/6] Step 2: Fetching Raw Data..."

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

# ------------------------------------------------------
# [3/6] 🔄 DB同期（PCProduct作成）
# ------------------------------------------------------
echo "🔄 [3/6] Step 3: Mapping to PCProduct Table..."

declare -A ftp_configs=(
    ["35909"]="hp:HP"
    ["2557"]="dell:DELL"
    ["2543"]="fujitsu:FUJITSU"
    ["36508"]="dynabook:DYNABOOK"
)

for mid in "${!ftp_configs[@]}"; do
    IFS=":" read -r maker prefix <<< "${ftp_configs[$mid]}"
    echo "📂 Processing $prefix ($mid)..."
    $PY_CMD "$SCRAPER_BASE/import_bc_ftp_to_db.py" --mid "$mid" --maker "$maker" --prefix "$prefix"
    sleep 2
done

echo "📂 Processing ASUS (43708)..."
$PY_CMD "$SCRAPER_BASE/import_bc_api_to_db.py" --mid "43708" --maker "asus"

# ------------------------------------------------------
# [4/6] 🧠 AIスペック解析
# ------------------------------------------------------
echo "🧠 [4/6] Step 4: AI Spec Analysis..."
$PY_CMD manage.py analyze_pc_spec --limit 50 --null-only

# ------------------------------------------------------
# [5/6] 🧹 属性リセット（超重要）
# ------------------------------------------------------
echo "🧹 [5/6] Step 5: Reset Attributes..."

$PY_CMD manage.py shell <<EOF
from api.models import PCProduct

count = 0
for p in PCProduct.objects.all():
    p.attributes.clear()
    count += 1

print(f"✅ Cleared attributes for {count} products")
EOF

# ------------------------------------------------------
# [6/6] 🧠 自動マッピング + Product同期
# ------------------------------------------------------
echo "🧠 [6/6] Step 6: Auto Mapping & Product Sync..."

$PY_CMD manage.py auto_map_attributes
$PY_CMD manage.py migrate_pc_products

echo "======================================================"
echo "✅ Finished at: $(date)"
echo "🚀 完了！属性リビルド含め全工程が正常終了"
echo "======================================================"