#!/bin/bash

# ==========================================================
# SHIN CORE LINX｜PC CLEAN PIPELINE
# /home/maya/shin-vps/scripts/pc_pipeline_clean.sh
# ==========================================================

set -e

export PATH=/usr/local/bin:/usr/bin:/bin

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

source "$SCRIPT_DIR/.env.pc"

# ==========================================================
# Project Root
# ==========================================================

PROJECT_ROOT="/home/maya/shin-vps"

# ==========================================================
# Compose Runtime
# ==========================================================

COMPOSE="docker compose \
  -p shin-vps \
  --env-file $PROJECT_ROOT/.env.production \
  -f $PROJECT_ROOT/docker-compose.yml \
  -f $PROJECT_ROOT/docker-compose.prod.yml"

# ==========================================================
# Logger
# ==========================================================

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# ==========================================================
# Django Wrapper
# ==========================================================

run_django() {

  $COMPOSE \
    exec -T "$DJANGO_CON" \
    python3 manage.py "$@"
}

run_django_raw() {

  $COMPOSE \
    exec -T "$DJANGO_CON" \
    "$@"
}

# ==========================================================
# START
# ==========================================================

log "🚀 START CLEAN PC PIPELINE"

# ==========================================================
# ① Import Raw API Data
# ==========================================================

log "📡 Import Linkshare"

run_django import_linkshare_api --mid 35909
run_django import_linkshare_api --mid 2557
run_django import_linkshare_api --mid 2543
run_django import_linkshare_api --mid 36508
run_django import_linkshare_api --mid 43708

# ==========================================================
# ② Reset Stock
# ==========================================================

log "🧹 Reset stock"

run_django reset_pc_stock

# ==========================================================
# ③ Transform → PCProduct
# ==========================================================

log "🔄 Transform → PCProduct"

run_django migrate_linkshare_to_pc

# ==========================================================
# ④ AI Semantic Analyze
# ==========================================================

log "🧠 Analyze"

run_django analyze_pc_spec \
  --limit 10 \
  --null-only

# ==========================================================
# ⑤ Attribute Sync
# ==========================================================

log "🏷️ Attributes"

docker cp \
  "$PROJECT_ROOT/django/master_data/attributes.tsv" \
  "$DJANGO_CON:/usr/src/app/master_data/attributes.tsv" \
  || {
    echo "❌ attributes.tsv copy failed"
    exit 1
  }

run_django sync_master_attributes

run_django auto_map_attributes_v2

# ==========================================================
# ⑥ Ranking Score
# ==========================================================

log "📊 Ranking"

run_django update_product_scores

# ==========================================================
# ⑦ Image Cache
# ==========================================================

log "🖼️ Image Cache"

run_django fetch_product_images --limit 500

# ==========================================================
# ⑧ Internal API Health Check
# ==========================================================

log "📈 API Check (internal)"

RESPONSE=$(
  docker exec "$DJANGO_CON" \
  curl -s \
  http://localhost:8000/api/general/pc-products/ranking/score/
)

echo "$RESPONSE" | head -n 1

# ==========================================================
# Empty Response Check
# ==========================================================

if [ -z "$RESPONSE" ]; then

  echo "❌ ERROR: API response empty"

  exit 1
fi

# ==========================================================
# Empty Array Check
# ==========================================================

if [[ "$RESPONSE" == "[]" ]]; then

  echo "❌ ERROR: API returned empty list"

  exit 1
fi

# ==========================================================
# DONE
# ==========================================================

log "✅ CLEAN PC PIPELINE COMPLETE"