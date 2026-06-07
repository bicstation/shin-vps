# ==========================================================
# FILE:
# /home/maya/shin-vps/scripts/pipeline_av_clean.sh
# ==========================================================

#!/bin/bash

set -e

# ==========================================================
# CONFIG
# ==========================================================

# Import
DUGA_PAGES=10
FANZA_PAGES=10

# Runtime
IMAGE_RUNTIME_LIMIT=500
IMAGE_RUNTIME_TIMEOUT=10

PREVIEW_RUNTIME_LIMIT=500

ATTRIBUTE_RUNTIME_LIMIT=200000
GROUP_RUNTIME_LIMIT=500

# Authority
AUTHORITY_DIR="/usr/src/app/master_data"

# API
API_PREVIEW_BYTES=500

DJANGO_CON=shin-local-django-v3-1

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
      DJANGO_CON=shin-local-django-v3-1
      ;;

    # ------------------------------------------------------
    # Staging
    # ------------------------------------------------------

    --stg)

      RUNTIME="stg"
      DJANGO_CON=shin-stg-django-v3-1
      ;;

    # ------------------------------------------------------
    # Production
    # ------------------------------------------------------

    --prod)

      RUNTIME="prod"
      DJANGO_CON=shin-prod-django-v3-1
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

run_django import_t_duga \
    --start_page 1 \
    --pages "${DUGA_PAGES}" \
    || true

log "STEP 02 : IMPORT FANZA"

run_django import_t_fanza \
    --site fanza \
    --pages "${FANZA_PAGES}" \
    || true

# ==========================================================
# STEP 03
# NORMALIZE
# ==========================================================

log "STEP 03-1 : NORMALIZE"

run_django normalize_duga || true
run_django normalize_fanza || true



log "STEP 03-2 : AUTHORITY"



docker cp \
"${PROJECT_ROOT}/django/master_data/semantic_attributes.tsv" \
"${DJANGO_CON}:${AUTHORITY_DIR}/semantic_attributes.tsv"

docker cp \
"${PROJECT_ROOT}/django/master_data/semantic_aliases.tsv" \
"${DJANGO_CON}:${AUTHORITY_DIR}/semantic_aliases.tsv"

docker cp \
"${PROJECT_ROOT}/django/master_data/semantic_groups.tsv" \
"${DJANGO_CON}:${AUTHORITY_DIR}/semantic_groups.tsv"

docker cp \
"${PROJECT_ROOT}/django/master_data/semantic_group_mappings.tsv" \
"${DJANGO_CON}:${AUTHORITY_DIR}/semantic_group_mappings.tsv"

docker cp \
"${PROJECT_ROOT}/django/master_data/semantic_normalization_rules.tsv" \
"${DJANGO_CON}:${AUTHORITY_DIR}/semantic_normalization_rules.tsv"


run_django import_specs \
"${AUTHORITY_DIR}/semantic_attributes.tsv"


# ==========================================================
# STEP 03-3
# SEMANTIC AUTHORITY GUARDIAN
# ==========================================================

log "STEP 03-3 : GUARDIAN"

run_django audit_semantic_universe


# ==========================================================
# STEP 04
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

log "STEP 04 : IMAGE"

run_django audit_images \
    --new-only \
    --limit "${IMAGE_RUNTIME_LIMIT}" \
    --timeout "${IMAGE_RUNTIME_TIMEOUT}" \
    || true

# ==========================================================
# STEP 05
# PREVIEW REALITY
# ==========================================================

log "STEP 05 : PREVIEW"

run_django sync_fanza_preview_reality \
    --limit "${PREVIEW_RUNTIME_LIMIT}" \
    || true


# ==========================================================
# STEP 06
# ATTRIBUTE RUNTIME
# ==========================================================


log "STEP 06 : ATTRIBUTE"

run_django auto_map_adult_attributes_v2 \
    --limit "${ATTRIBUTE_RUNTIME_LIMIT}"



# run_django auto_map_adult_attributes

# ==========================================================
# STEP 07
# GROUP RUNTIME
# ==========================================================

log "STEP 07 : GROUP"

run_django compile_adult_runtime \
    --limit "${GROUP_RUNTIME_LIMIT}"


# ==========================================================
# STEP 8
# SEMANTIC RUNTIME
# ==========================================================

log "STEP 08 : SEMANTIC"

echo "[SKIP]"
echo "build_adult_runtime"


# ==========================================================
# STEP 09
# RANKING RUNTIME
# ==========================================================


log "STEP 09 : RANKING"

echo "[SKIP]"
echo "update_adult_scores"


# run_django update_adult_scores

# ==========================================================
# STEP 10
# API HEALTH CHECK
# ==========================================================

log "STEP 10 : API HEALTH"

echo ""
echo "UNIFIED PRODUCTS"
curl -s \
http://localhost:8083/api/adult/unified-products/ \
| head -c "${API_PREVIEW_BYTES}"

echo ""
echo ""

echo "RANKING"
curl -s \
http://localhost:8083/api/adult/ranking/ \
| head -c "${API_PREVIEW_BYTES}"

echo ""
echo ""

echo
echo "SIDEBAR STATS"

RESPONSE=$(
curl -s \
http://localhost:8083/api/adult/sidebar-stats/
)

curl -s \
http://localhost:8083/api/adult/sidebar-stats/ \
| head -c "${API_PREVIEW_BYTES}"


echo "$RESPONSE" | head -c 500

echo

echo "$RESPONSE" | python -m json.tool >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ VALID JSON"
else
    echo "❌ INVALID JSON"
fi

# ==========================================================
# STEP 11
# VALIDATION
# ==========================================================

log "STEP 11 : VALIDATION"


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
echo"*********************************"
log "AVFLASH CLEAN PIPELINE COMPLETE"
echo"*********************************"