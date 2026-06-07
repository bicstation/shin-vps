#!/bin/bash

# ==========================================================
# SHIN CORE LINX｜SEMANTIC PC PIPELINE
# /home/maya/shin-vps/scripts/pc_pipeline_semantic.sh
# ==========================================================

set -e

export PATH=/usr/local/bin:/usr/bin:/bin

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ==========================================================
# Runtime Variables
# ==========================================================

AI_SPEC_LIMIT=30
AI_SUMMARY_LIMIT=30
AI_SEMANTIC_LIMIT=30
IMAGE_CACHE_LIMIT=50

# ==========================================================
# Project Root Topology
# ==========================================================

PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ==========================================================
# Runtime Config
# ==========================================================

source "$PROJECT_ROOT/.env.pc"

# ==========================================================
# Runtime Environment
# ==========================================================

RUNTIME="local"

for ARG in "$@"
do

  case "$ARG" in

    # ------------------------------------------------------
    # Local
    # ------------------------------------------------------

    --local)

      RUNTIME="local"
      ;;

    # ------------------------------------------------------
    # Staging
    # ------------------------------------------------------

    --stg)

      RUNTIME="stg"
      ;;

    # ------------------------------------------------------
    # Production
    # ------------------------------------------------------

    --prod)

      RUNTIME="prod"
      ;;

    # ------------------------------------------------------
    # Unknown
    # ------------------------------------------------------

    *)

      echo "❌ Unknown argument: $ARG"

      echo ""
      echo "Usage:"
      echo "  ./pc_pipeline_.sh --local"
      echo "  ./pc_pipeline_semantic.sh --stg"
      echo "  ./pc_pipeline_semantic.sh --prod"

      exit 1
      ;;
  esac

done

# ==========================================================
# Environment Mapping
# ==========================================================

if [ "$RUNTIME" = "local" ]; then

  ENV_FILE=".env.local"
  COMPOSE_OVERRIDE="docker-compose.local.yml"
  PROJECT_NAME="shin-local"

elif [ "$RUNTIME" = "stg" ]; then

  ENV_FILE=".env.stg"
  COMPOSE_OVERRIDE="docker-compose.stg.yml"
  PROJECT_NAME="shin-stg"

elif [ "$RUNTIME" = "prod" ]; then

  ENV_FILE=".env.production"
  COMPOSE_OVERRIDE="docker-compose.prod.yml"
  PROJECT_NAME="shin-prod"

else

  echo "❌ Unknown runtime: $RUNTIME"

  exit 1
fi

# ==========================================================
# Runtime Info
# ==========================================================

echo ""
echo "=========================================================="
echo "🌌 SHIN CORE LINX PIPELINE CONFIG"
echo "=========================================================="

echo "AI_SPEC_LIMIT      = $AI_SPEC_LIMIT"
echo "AI_SUMMARY_LIMIT   = $AI_SUMMARY_LIMIT"
echo "AI_SEMANTIC_LIMIT  = $AI_SEMANTIC_LIMIT"
echo "IMAGE_CACHE_LIMIT  = $IMAGE_CACHE_LIMIT"

echo "=========================================================="

# ==========================================================
# Compose Runtime
# ==========================================================

COMPOSE="docker compose \
  -p $PROJECT_NAME \
  --env-file $PROJECT_ROOT/$ENV_FILE \
  -f $PROJECT_ROOT/docker-compose.yml \
  -f $PROJECT_ROOT/$COMPOSE_OVERRIDE"

# ==========================================================
# Logger
# ==========================================================

log() {

  echo ""
  echo "=========================================================="
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "=========================================================="
}

# ==========================================================
# Django Wrapper
# ==========================================================

run_django() {

  $COMPOSE \
    exec -T "$DJANGO_SERVICE" \
    python3 manage.py "$@"
}

run_django_raw() {

  $COMPOSE \
    exec -T "$DJANGO_SERVICE" \
    "$@"
}

# ==========================================================
# Internal API Check
# ==========================================================

check_api() {

  local URL=$1

  log "📡 API CHECK: $URL"

  RESPONSE=$(
    $COMPOSE exec "$DJANGO_SERVICE" \
    curl -s \
    "$URL"
  )


  echo "$RESPONSE" | head -c 1000

  echo ""

  # --------------------------------------------------------
  # Empty Response
  # --------------------------------------------------------

  if [ -z "$RESPONSE" ]; then

    echo "❌ ERROR: Empty API response"

    exit 1
  fi

  # --------------------------------------------------------
  # Empty Array
  # --------------------------------------------------------

  if [[ "$RESPONSE" == "[]" ]]; then

    echo "❌ ERROR: API returned empty list"

    exit 1
  fi
}

# ==========================================================
# START
# ==========================================================

log "🚀 START SHIN CORE LINX SEMANTIC PIPELINE 12 Components"

# ==========================================================
# ①  01 Import Raw API Data
# ==========================================================

log "📡 (01/11) Import Linkshare API"

run_django import_linkshare_api --mid 35909
run_django import_linkshare_api --mid 2557
run_django import_linkshare_api --mid 2543
run_django import_linkshare_api --mid 36508
run_django import_linkshare_api --mid 43708

# ==========================================================
# ② 02 Reset Stock
# ==========================================================

log "🧹 (02/11) Reset Product Stock"

run_django reset_pc_stock

# ==========================================================
# ③ 03 Transform → PCProduct
# ==========================================================

log "🔄 (03/11) Transform Raw → PCProduct"

run_django migrate_linkshare_to_pc

# ==========================================================
# ④ 04-1 AI SPEC COMPLETION
# ==========================================================

log "🤖 (04-1/11) AI Spec Completion"

run_django analyze_pc_ai \
  --limit $AI_SPEC_LIMIT

# ==========================================================
# ④ 04-2 AI SUMMARY
# ==========================================================

log "📝 (04-2/11) AI Summary Generation"

run_django analyze_pc_ai_summary \
  --limit $AI_SUMMARY_LIMIT

# ==========================================================
# ④ 04-3 AI Semantic Analyze
# ==========================================================


log "🧠 (04-3/11) Semantic Analyze"

run_django analyze_pc_spec \
  --limit $AI_SEMANTIC_LIMIT \
  --needs-runtime

# ==========================================================
# ⑤ 05-1 Attribute TSV Sync
# ==========================================================

log "🏷️ (05-1/11) Sync Attribute Master"

$COMPOSE cp \
  "$PROJECT_ROOT/django/master_data/attributes.tsv" \
  "$DJANGO_SERVICE:/usr/src/app/master_data/attributes.tsv" \
  || {
    echo "❌ attributes.tsv copy failed"
    exit 1
  }

run_django sync_master_attributes

# ==========================================================
# ⑥ 05-2 Semantic TSV Sync
# ==========================================================

log "🧠 (05-2/11) Sync Semantic Master"

SEMANTIC_FILES=(

  "semantic_aliases.tsv"
  "semantic_negative_aliases.tsv"
  "semantic_normalization_rules.tsv"
  "semantic_groups.tsv"
  "semantic_group_mappings.tsv"
  "semantic_attributes.tsv"
)

for FILE in "${SEMANTIC_FILES[@]}"
do

  log "📄 Copy $FILE"

  $COMPOSE cp \
    "$PROJECT_ROOT/django/master_data/$FILE" \
    "$DJANGO_SERVICE:/usr/src/app/master_data/$FILE" \
    || {
      echo "❌ $FILE copy failed"
      exit 1
    }

done


# ==========================================================
# ⑦ 06 Attribute Auto Mapping
# ==========================================================

log "🔗 (06/11) Auto Map Semantic Attributes"
run_django auto_map_attributes_v2


# ==========================================================
# ⑥ 07 Guardian Audit
# ==========================================================

log "🛡️ (07/11) Semantic Authority Guardian"

run_django audit_semantic_universe


# ==========================================================
# ⑧ 08 Product Score Runtime
# ==========================================================

log "📊 (08/11) Update Product Scores"
run_django update_product_scores

# ==========================================================
# ⑨ 09 Semantic Runtime Build
# ==========================================================

log "🚀 (09/11) Build Semantic Runtime"
run_django rebuild_semantic_runtime

# ==========================================================
# ⑩ 10 Image Cache
# ==========================================================

log "🖼️ (10/11)  Cache Product Images"
run_django fetch_product_images --limit $IMAGE_CACHE_LIMIT

# ==========================================================
# ⑪ 11 Internal Semantic API Health Check
# ==========================================================

log "📈 (11/11) Semantic Runtime Health Check"

# ----------------------------------------------------------
# Ranking Runtime
# ----------------------------------------------------------

check_api \
"http://localhost:8000/api/general/pc-products/ranking/"

# ----------------------------------------------------------
# Discovery Runtime
# ----------------------------------------------------------

check_api \
"http://localhost:8000/api/general/semantic/discovery/"

# ----------------------------------------------------------
# Shelves Runtime
# ----------------------------------------------------------

check_api \
"http://localhost:8000/api/general/semantic/shelves/"

# ==========================================================
# ⑫ 11 Semantic Runtime Validation
# ==========================================================

log "🧠 (11/11) Validate Semantic Runtime"

run_django shell -c "

from api.models import PCProduct

count = PCProduct.objects.exclude(
    semantic_runtime__isnull=True
).count()

print(f'SEMANTIC_RUNTIME_COUNT={count}')

if count <= 0:
    raise Exception('semantic runtime empty')
"

# ==========================================================
# ⑬ 12 Semantic Related Validation
# ==========================================================

log "🔗 (12/11) Validate Semantic Related"

run_django shell -c "

from api.models import PCProduct

sample = PCProduct.objects.exclude(
    semantic_runtime__isnull=True
).first()

if not sample:
    raise Exception('no semantic sample')

print(sample.name)
print(sample.semantic_runtime)
"

# ==========================================================
# DONE
# ==========================================================

log "✅ SHIN CORE LINX SEMANTIC PIPELINE COMPLETE 終了"