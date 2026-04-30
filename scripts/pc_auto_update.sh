#!/bin/bash
set -e  # ❗どこかで失敗したら即停止

# ===============================
# 🚀 PC AUTO UPDATE UNIVERSAL
# ===============================

# 設定読み込み
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/.env.pc"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# -------------------------
# 実行ラッパー（環境吸収）
# -------------------------
run_django() {
  if [ "$USE_DOCKER" = "true" ]; then
    docker compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec -T "$DJANGO_CON" python3 manage.py "$@"
  else
    $PYTHON_BIN "$PROJECT_ROOT/$MANAGE_PATH" "$@"
  fi
}

run_django_raw() {
  if [ "$USE_DOCKER" = "true" ]; then
    docker compose -f "$PROJECT_ROOT/$COMPOSE_FILE" exec -T "$DJANGO_CON" "$@"
  else
    "$@"
  fi
}

log "🚀 START PC AUTO UPDATE"

# -------------------------
# ① データ取得
# -------------------------
log "📡 Import"
run_django import_linkshare_data --mid 35909
run_django import_linkshare_data --mid 2557
run_django import_linkshare_data --mid 2543
run_django import_linkshare_data --mid 36508
run_django linkshare_bc_api_parser --mid 43708 --save-db

# -------------------------
# ② DB同期
# -------------------------
log "🔄 DB Sync"
SB="/usr/src/app/scrapers/src/shops"

run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 35909 --maker hp --prefix HP
run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 2557 --maker dell --prefix DELL
run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 2543 --maker fujitsu --prefix FUJITSU
run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 36508 --maker dynabook --prefix DYNABOOK
run_django_raw python3 "$SB/import_bc_api_to_db.py" --mid 43708 --maker asus

# -------------------------
# ③ AI解析
# -------------------------
log "🧠 Analyze"
run_django analyze_pc_spec --limit 50 --null-only

# -------------------------
# ④ 属性同期
# -------------------------
log "🏷️ Attributes"

if [ "$USE_DOCKER" = "true" ]; then
  docker cp "$PROJECT_ROOT/django/master_data/attributes.tsv" "$DJANGO_CON:/usr/src/app/master_data/attributes.tsv"
fi

run_django sync_master_attributes
run_django auto_map_attributes

# -------------------------
# ⑤ Product同期
# -------------------------
log "🔄 Product Sync"
run_django migrate_pc_products

# -------------------------
# ⑥ Ranking更新
# -------------------------
log "📊 Ranking"
run_django update_product_scores

# -------------------------
# ⑦ 画像キャッシュ
# -------------------------
log "🖼️ Image Cache"

FLAG_FILE="$PROJECT_ROOT/.image_cache_done.flag"

if [ ! -f "$FLAG_FILE" ]; then
  run_django fetch_product_images --limit 100 --force
  touch "$FLAG_FILE"
else
  run_django fetch_product_images --limit 30
fi

# -------------------------
# ⑧ API確認
# -------------------------
log "📈 API Check"
curl -s "$API_BASE/api/products/ranking/" | head -n 1

log "✅ DONE"