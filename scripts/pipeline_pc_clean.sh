#!/bin/bash

# ==========================================================
# SHIN CORE LINX｜SEMANTIC PC PIPELINE
# /home/maya/shin-vps/scripts/pc_pipeline_semantic.sh
# ==========================================================

# ./pipeline.sh \
#     --import all \
#     --transform all \
#     --ai-spec 20 \
#     --ai-summary 20 \
#     --ai-semantic 20 \
#     --runtime all \
#     --image-cache 50
# # AI処理を全部20件
# ./pipeline.sh --local --ai 20
# # Summaryだけ5件
# ./pipeline.sh --local --ai 20 --ai-summary 5
# # Semanticだけ全件
# ./pipeline.sh --local --ai 20 --ai-semantic all
# # AIは実行せず画像だけ
# ./pipeline.sh --local --image-cache 100
# 
# # AI処理を全部20件
# ./pipeline.sh --prod --ai 20
# # Summaryだけ5件
# ./pipeline.sh --prod --ai 20 --ai-summary 5
# # Semanticだけ全件
# ./pipeline.sh --prod --ai 20 --ai-semantic all
# # AIは実行せず画像だけ
# ./pipeline.sh --prod --image-cache 100

set -e

export PATH=/usr/local/bin:/usr/bin:/bin

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ==========================================================
# Runtime Variables
# ==========================================================

AI_SPEC_LIMIT=0
AI_SUMMARY_LIMIT=0
AI_SEMANTIC_LIMIT=0
IMAGE_CACHE_LIMIT=0


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


while [ $# -gt 0 ]
do

    case "$1" in

        --ai)

            AI_SPEC_LIMIT="$2"
            AI_SUMMARY_LIMIT="$2"
            AI_SEMANTIC_LIMIT="$2"
            shift 2
            ;;

        --ai-spec)

            AI_SPEC_LIMIT="$2"
            shift 2
            ;;

        --ai-summary)

            AI_SUMMARY_LIMIT="$2"
            shift 2
            ;;

        --ai-semantic)

            AI_SEMANTIC_LIMIT="$2"
            shift 2
            ;;

        --image-cache)

            IMAGE_CACHE_LIMIT="$2"
            shift 2
            ;;

        --local)

            RUNTIME="local"
            shift
            ;;

        --stg)

            RUNTIME="stg"
            shift
            ;;

        --prod)

            RUNTIME="prod"
            shift
            ;;

        *)

            echo "Unknown option: $1"
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

log "📡 (01/12) Import Linkshare API"

# 2543   FUJITSU
# 2557   DELL
# 35909  HP
# 36508  DYNABOOK
# 43708  ASUS

# run_django import_linkshare_api --mid 35909
# run_django import_linkshare_api --mid 2557
# run_django import_linkshare_api --mid 2543
# run_django import_linkshare_api --mid 36508
run_django import_linkshare_api --mid 43708

run_django import_linkshare_data --mid 2543
run_django import_linkshare_data --mid 2557
run_django import_linkshare_data --mid 35909
run_django import_linkshare_data --mid 36508

# ==========================================================
# ② 02 Reset Stock
# ==========================================================

log "🧹 (02/12) Reset Product Stock"

run_django reset_pc_stock

# ==========================================================
# ③ 03 Transform → PCProduct
# ==========================================================

log "🔄 (03/12) Transform Raw → PCProduct"

run_django import_linkshare_pc --all

# ==========================================================
# ④ 04-1 AI SPEC COMPLETION
# ==========================================================

log "🤖 (04-1/12) AI Spec Completion"

run_django compile_spec_runtime \
  --limit $AI_SPEC_LIMIT

# ==========================================================
# ④ 04-2 AI SUMMARY
# ==========================================================

log "📝 (04-2/12) AI Summary Generation"

run_django compile_human_runtime \
  --limit $AI_SUMMARY_LIMIT

# ==========================================================
# ④ 04-3 AI Semantic Analyze
# ==========================================================


log "🧠 (04-3/12) Semantic Analyze"

run_django compile_semantic_runtime \
  --limit $AI_SEMANTIC_LIMIT \
  --needs-runtime


# ==========================================================
# ⑤ 05-1 Attribute TSV Sync
# ==========================================================

log "🏷️ (05-1/12) Sync Attribute Master"

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

log "🧠 (05-2/12) Sync Semantic Master"

SEMANTIC_FILES=(

  "semantic_aliases.tsv"
  "semantic_negative_aliases.tsv"
  "semantic_normalization_rules.tsv"
  "semantic_groups.tsv"
  "semantic_group_mappings.tsv"
  "semantic_attributes.tsv"
  "semantic_slug_metadata.tsv"
  "semantic_workflow_mappings.tsv"
  "semantic_universes.tsv"

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
# ⑦ 05-3 Authority Integrity Audit
# ==========================================================

log "🛡️ (05-3/12) Slug Metadata Audit"

run_django audit_slug_metadata


# ==========================================================
# ⑦ 06 Attribute Auto Mapping
# ==========================================================

log "🔗 (06-1/12) Complile Sematic Runtime"
run_django compile_semantic_authority



log "🔗 (06-2/12) Auto Map Semantic Attributes"
run_django auto_map_attributes_v2


# ==========================================================
# ⑥ 07 Guardian Audit
# ==========================================================

log "🛡️ (07/12) Semantic Authority Guardian"

run_django audit_semantic_universe


# ==========================================================
# ⑧ 08 Product Score Runtime
# ==========================================================

# log "📊 (08/12) Update Product Scores"
# run_django update_product_scores

# ==========================================================
# ⑨ 09 Semantic Runtime Build
# ==========================================================

# log "🚀 (09/12) Build Semantic Runtime"
log "🚀 (09/12) Build Unified Runtime"
# run_django rebuild_semantic_runtime
run_django rebuild_unified_runtime


# ==========================================================
# ⑩ 10 Image Cache
# ==========================================================

log "🖼️ (10/12)  Cache Product Images"
run_django fetch_product_images --limit $IMAGE_CACHE_LIMIT

# ==========================================================
# ⑪ 11 Internal Semantic API Health Check
# ==========================================================

log "📈 (11/12) Semantic Runtime Health Check"

# ==========================================================
# ⑪ 12 属性　API　検証
# ==========================================================

log "📈 (11-1/12) 属性"

run_django audit_semantic_coverage

# ----------------------------------------------------------
# Ranking Runtime
# ----------------------------------------------------------

log "📈 (11-2/12) TOP-API チェック"

check_api \
"http://localhost:8000/api/pc/top/"

# ----------------------------------------------------------
# Discovery Runtime
# ----------------------------------------------------------

log "📈 (11-3/12) DISCOVER-API チェック"

check_api \
"http://localhost:8000/api/pc/discover/"

# ==========================================================
# ⑫ 11 Semantic Runtime Validation
# ==========================================================
log "🧠 (11-4/12) Validate Semantic Runtime"

run_django shell <<'PYTHON'
from api.models import PCProduct

count = PCProduct.objects.filter(
    semantic_runtime__semantic_version='unified_v1'
).count()

print(f'UNIFIED_RUNTIME_COUNT={count}')

if count <= 0:
    raise Exception('unified runtime empty')
PYTHON

# ==========================================================
# ⑬ 12 Semantic Related Validation
# ==========================================================

log "🔗 (12/12) Validate Semantic Related"

run_django shell <<'PYTHON'

from api.models import PCProduct

sample = PCProduct.objects.exclude(
    semantic_runtime__isnull=True
).first()

if not sample:
    raise Exception('no semantic sample')

print(sample.semantic_runtime.get('semantic_version'))
print(sample.semantic_runtime.get('product_type'))
print(sample.semantic_runtime.get('semantic_score'))
print(sample.semantic_runtime.get('workflow_score'))

PYTHON

# ==========================================================
# DONE
# ==========================================================

log "✅ コンシェルジェ未登録語一覧"

run_django audit_unknown_intents

log "✅ SHIN CORE LINX SEMANTIC PIPELINE COMPLETE 終了"