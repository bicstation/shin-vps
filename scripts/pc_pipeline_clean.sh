#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/.env.pc"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

run_django() {
  docker compose \
    --env-file "$PROJECT_ROOT/.env.local" \
    -f "$PROJECT_ROOT/$COMPOSE_FILE" \
    exec -T "$DJANGO_CON" python3 manage.py "$@"
}

run_django_raw() {
  docker compose \
    --env-file "$PROJECT_ROOT/.env.local" \
    -f "$PROJECT_ROOT/$COMPOSE_FILE" \
    exec -T "$DJANGO_CON" "$@"
}

# ==========================================================
log "🚀 START CLEAN PC PIPELINE"
# ==========================================================

# ① Import（生データ）
log "📡 Import Linkshare"
run_django import_linkshare_api --mid 35909
run_django import_linkshare_api --mid 2557
run_django import_linkshare_api --mid 2543
run_django import_linkshare_api --mid 36508
run_django import_linkshare_api --mid 43708

# 🔥 追加（ここが重要）
log "🧹 Reset stock"
run_django reset_pc_stock

# ② Transform（唯一のPCProduct生成）
log "🔄 Transform → PCProduct"
run_django migrate_linkshare_to_pc

# ③ AI解析
log "🧠 Analyze"
run_django analyze_pc_spec --limit 2000 --null-only

# ④ 属性同期
log "🏷️ Attributes"

docker cp "$PROJECT_ROOT/django/master_data/attributes.tsv" \
  "$DJANGO_CON:/usr/src/app/master_data/attributes.tsv" \
  || { echo "❌ attributes.tsv copy failed"; exit 1; }

run_django sync_master_attributes
run_django auto_map_attributes_v2

# ⑤ スコア
log "📊 Ranking"
run_django update_product_scores

# ⑥ 画像
log "🖼️ Image Cache"
run_django fetch_product_images --limit 500

# ⑦ APIチェック（🔥内部確認に変更）
log "📈 API Check (internal)"

RESPONSE=$(docker exec "$DJANGO_CON" \
  curl -s http://localhost:8000/api/general/pc-products/ranking/score/)

echo "$RESPONSE" | head -n 1

# ❌ 空チェック
if [ -z "$RESPONSE" ]; then
  echo "❌ ERROR: API response empty"
  exit 1
fi

# ❌ 空配列チェック
if [[ "$RESPONSE" == "[]" ]]; then
  echo "❌ ERROR: API returned empty list"
  exit 1
fi

log "✅ DONE"