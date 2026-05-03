#!/bin/bash
# ==============================================================================
# 🚀 SHIN CORE LINX｜PC AUTO UPDATE UNIVERSAL v4（評価エンジン対応版）
# ==============================================================================

set -e

# -------------------------
# ■ 初期設定
# -------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$SCRIPT_DIR/.env.pc" ]; then
  echo "❌ .env.pc not found"
  exit 1
fi

source "$SCRIPT_DIR/.env.pc"

# -------------------------
# ■ ログ
# -------------------------
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
  echo "❌ ERROR: $1"
  exit 1
}

# -------------------------
# ■ Django実行
# -------------------------
run_django() {
  if [ "$USE_DOCKER" = "true" ]; then
    docker compose \
      --env-file "$PROJECT_ROOT/.env.local" \
      -f "$PROJECT_ROOT/$COMPOSE_FILE" \
      exec -T "$DJANGO_CON" python3 manage.py "$@"
  else
    $PYTHON_BIN "$PROJECT_ROOT/$MANAGE_PATH" "$@"
  fi
}

run_django_raw() {
  if [ "$USE_DOCKER" = "true" ]; then
    docker compose \
      --env-file "$PROJECT_ROOT/.env.local" \
      -f "$PROJECT_ROOT/$COMPOSE_FILE" \
      exec -T "$DJANGO_CON" "$@"
  else
    "$@"
  fi
}

# -------------------------
# ■ START
# -------------------------
log "🚀 START PC AUTO UPDATE (V4)"

# ==============================================================================
# ① データ取得
# ==============================================================================
log "📡 Import"

run_django import_linkshare_data --mid 35909
run_django import_linkshare_data --mid 2557
run_django import_linkshare_data --mid 2543
run_django import_linkshare_data --mid 36508
run_django linkshare_bc_api_parser --mid 43708 --save-db

# ==============================================================================
# ② DB同期
# ==============================================================================
log "🔄 DB Sync"

SB="/usr/src/app/scrapers/src/shops"

run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 35909 --maker hp --prefix HP
run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 2557 --maker dell --prefix DELL
run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 2543 --maker fujitsu --prefix FUJITSU
run_django_raw python3 "$SB/import_bc_ftp_to_db.py" --mid 36508 --maker dynabook --prefix DYNABOOK
run_django_raw python3 "$SB/import_bc_api_to_db.py" --mid 43708 --maker asus

# ==============================================================================
# ③ AI解析（補完）
# ==============================================================================
log "🧠 Analyze"

run_django analyze_pc_spec --limit 1000 --null-only

# ==============================================================================
# ④ 属性同期（最重要：ここが今回の修正）
# ==============================================================================
log "🏷️ Attributes (V2)"

# TSV同期（属性マスタ）
if [ "$USE_DOCKER" = "true" ]; then
  docker cp "$PROJECT_ROOT/django/master_data/attributes.tsv" \
    "$DJANGO_CON:/usr/src/app/master_data/attributes.tsv" \
    || error_exit "Failed to copy attributes.tsv"
fi

run_django sync_master_attributes

# 🔥 ここが核心（旧 → 新）
run_django auto_map_attributes_v2

# ==============================================================================
# ⑤ Product同期
# ==============================================================================
log "🔄 Product Sync"

run_django migrate_pc_products

# ==============================================================================
# ⑥ スコア更新（ランキングエンジン）
# ==============================================================================
log "📊 Ranking"

run_django update_product_scores

# ==============================================================================
# ⑦ 画像キャッシュ
# ==============================================================================
log "🖼️ Image Cache"

FLAG_FILE="$PROJECT_ROOT/.image_cache_done.flag"

if [ ! -f "$FLAG_FILE" ]; then
  log "⚡ First run: full image fetch"
  run_django fetch_product_images --limit 100 --force
  touch "$FLAG_FILE"
else
  log "⚡ Incremental image fetch"
  run_django fetch_product_images --limit 30
fi

# ==============================================================================
# ⑧ API確認（最終チェック）
# ==============================================================================
log "📈 API Check"

RESPONSE=$(curl -s "$API_BASE/products/ranking/")

echo "$RESPONSE" | head -n 1

if [ -z "$RESPONSE" ]; then
  error_exit "API response empty"
fi

if [[ "$RESPONSE" == "[]" ]]; then
  error_exit "API returned empty list"
fi

log "✅ DONE"