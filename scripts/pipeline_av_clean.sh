# ==========================================================
# FILE:
# /home/maya/shin-vps/scripts/pipeline_av_clean.sh
# ==========================================================

#!/bin/bash

set -e

# ==========================================================
# PATH
# ==========================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"


export PATH=/usr/local/bin:/usr/bin:/bin

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

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
      echo "  ./pipeline_av_clean.sh --local"
      echo "  ./pipeline_av_clean.sh --stg"
      echo "  ./pipeline_av_clean.sh --prod"

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
echo "🌌 SHIN CORE LINX RUNTIME"
echo "=========================================================="
echo "RUNTIME: $RUNTIME"
echo "ENV FILE: $ENV_FILE"
echo "COMPOSE: $COMPOSE_OVERRIDE"
echo "=========================================================="

# ==========================================================
# LOGGER
# ==========================================================

log() {
echo ""
echo "=========================================================="
echo "$1"
echo "=========================================================="
}

# ==========================================================
# Compose Authority
# ==========================================================
COMPOSE_ARGS=(
    -f "$PROJECT_ROOT/docker-compose.yml"
    -f "$PROJECT_ROOT/$COMPOSE_OVERRIDE"
)

compose_exec() {
    docker compose "${COMPOSE_ARGS[@]}" "$@"
}

run_django() {
    compose_exec \
        -p "$PROJECT_NAME" \
        exec \
        -T \
        "$DJANGO_SERVICE" \
        python3 manage.py "$@"
}

# ==========================================================
# START
# ==========================================================

log "AVFLASH CLEAN PIPELINE START"


# ==========================================================
# STEP 0-5
# NORMALIZE 同期
# ==========================================================

log "STEP 0-5 : NORMALIZE 同期"

run_django sync_fanza_floor_master || true

# ==========================================================
# STEP 01
# DUGA RAW IMPORT
# ==========================================================

log "STEP 01 : IMPORT DUGA"
run_django import_t_duga || true

# ==========================================================
# FANZA IMPORT SETTINGS
#
# pages:
#   取得ページ数
#
#   1  = 開発用 (高速)
#   5  = 本番運用
#   10 = 大規模同期
#
# all_floors:
#   FANZA全フロア取得
#
#   例:
#   - video
#   - amateur
#   - comic
#   - doujin
#   - book
#   - vr
#
# 注意:
#   pages を増やすと
#   RawApiData が大量生成される。
#
# ==========================================================

FANZA_IMPORT_PAGES=1
FANZA_IMPORT_ALL_FLOORS=true

# 本番例
# FANZA_IMPORT_PAGES=5

# ==========================================================
# STEP 02
# FANZA RAW IMPORT
#
# 目的:
#   FANZA APIからRawApiDataを取得する。
#
# 保存先:
#   RawApiData
#
# 後続処理:
#
#   import_t_fanza
#          ↓
#   normalize_fanza
#          ↓
#   AdultProduct
#          ↓
#   Image Runtime
#
# 注意:
#   この段階では AdultProduct は生成されない。
#
#   取得のみ実施する。
#
# Runtime Layer:
#   Data Acquisition Layer
#
# ==========================================================

log "STEP 02 : IMPORT FANZA"

run_django import_t_fanza \
    --site fanza \
    --pages 10 \
    || true

# ==========================================================
# Expected Result
#
# RawApiData
#   +XXXX records
#
# AdultProduct
#   unchanged
#
# 次工程:
#   STEP 03 NORMALIZE
#
# ==========================================================

# ==========================================================
# STEP 03
# NORMALIZE
# ==========================================================

log "STEP 03 : NORMALIZE"

run_django normalize_duga || true
run_django normalize_fanza || true

# ==========================================================
# STEP 03-5
# IMAGE RUNTIME
#
# SHIN CORE LINX Runtime Layer
#
# Import
# ↓
# Normalize
# ↓
# Image Runtime
# ↓
# Sync Runtime
# ↓
# Validation
#
# Frontend:
#   image_valid
#
# Backend:
#   image_status
#
# ==========================================================

IMAGE_RUNTIME_LIMIT=500
IMAGE_RUNTIME_TIMEOUT=10

log "STEP 03-5 : IMAGE RUNTIME"

run_django audit_images \
    --new-only \
    --limit "${IMAGE_RUNTIME_LIMIT}" \
    --timeout "${IMAGE_RUNTIME_TIMEOUT}" \
    || true


# ==========================================================
# STEP 03-6
# PREVIEW REALITY
# ==========================================================

log "STEP 03-6 : PREVIEW REALITY"

run_django sync_fanza_preview_reality \
    --limit 500 \
    || true



# ==========================================================
# STEP 04
# GENRE SYNC
# ==========================================================

# log "STEP 04 : GENRE SYNC"

# run_django sync_adult_genres || true

# ==========================================================
# STEP 05
# MAKER SYNC
# ==========================================================

# log "STEP 05 : MAKER SYNC"

# run_django sync_adult_makers || true

# ==========================================================
# STEP 06
# SERIES SYNC
# ==========================================================

# log "STEP 06 : SERIES SYNC"

# run_django sync_adult_series || true

# ==========================================================
# STEP 07
# ACTRESS SYNC
# ==========================================================

# log "STEP 07 : ACTRESS SYNC"

# run_django sync_adult_actresses || true

# ==========================================================
# STEP 08
# ATTRIBUTE RUNTIME
# ==========================================================

log "STEP 08 : ATTRIBUTE RUNTIME"

run_django auto_map_adult_attributes_v2 \
    --limit 500

# run_django auto_map_adult_attributes

# ==========================================================
# STEP 09
# GROUP RUNTIME
# ==========================================================

log "STEP 09 : GROUP RUNTIME"

run_django compile_adult_runtime \
    --limit 500

# run_django compile_adult_groups

# ==========================================================
# STEP 10
# SEMANTIC RUNTIME
# ==========================================================

log "STEP 10 : SEMANTIC RUNTIME"

echo "[SKIP]"
echo "build_adult_runtime"

# run_django build_adult_runtime

# ==========================================================
# STEP 11
# RANKING RUNTIME
# ==========================================================

log "STEP 11 : RANKING RUNTIME"

echo "[SKIP]"
echo "update_adult_scores"

# run_django update_adult_scores

# ==========================================================
# STEP 12
# API HEALTH CHECK
# ==========================================================

log "STEP 12 : API HEALTH CHECK"

echo ""
echo "UNIFIED PRODUCTS"
curl -s \
http://localhost:8083/api/adult/unified-products/ \
| head -c 500

echo ""
echo ""

echo "RANKING"
curl -s \
http://localhost:8083/api/adult/ranking/ \
| head -c 500

echo ""
echo ""


echo
echo "SIDEBAR STATS"

RESPONSE=$(
curl -s \
http://localhost:8083/api/adult/sidebar-stats/
)

echo "$RESPONSE" | head -c 500

echo

echo "$RESPONSE" | python -m json.tool >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ VALID JSON"
else
    echo "❌ INVALID JSON"
fi

# ==========================================================
# STEP 13
# VALIDATION
# ==========================================================

log "STEP 13 : VALIDATION"


run_django shell -c "

from api.models import ( AdultProduct, ImageAudit, )

print()
print('PRODUCTS')
print(
AdultProduct.objects.count()
)

print()
print('HAS ATTRIBUTES')
print(
AdultProduct.objects.filter(
has_attributes=True
).count()
)

print()
print('IMAGE AUDITS')

print(
ImageAudit.objects.count()
)

from django.db.models import Count
from api.models import ImageAudit

print()
print('IMAGE STATUS')

for row in (
    ImageAudit.objects
    .values('image_status')
    .annotate(total=Count('id'))
):
    print(row)

print()
print("HAS ATTRIBUTES")

print(
    AdultProduct.objects.filter(
        has_attributes=True
    ).count()
)



"

# ==========================================================
# COMPLETE
# ==========================================================

log "AVFLASH CLEAN PIPELINE COMPLETE"
