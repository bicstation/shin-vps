#!/bin/bash

# ==========================================================
# SHIN CORE LINX
# PC RUNTIME PIPELINE
# CONFIGURATION
# ==========================================================

# ==========================================================
# PROJECT ROOT
# ==========================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# ==========================================================
# RUNTIME
#
# Supported:
#
#   local
#   stg
#   prod
#
# Default:
#
#   local
#
# Can be overridden:
#
#   RUNTIME=local
#   RUNTIME=stg
#   RUNTIME=prod
#
# ==========================================================

RUNTIME="${RUNTIME:-local}"

# ==========================================================
# ENVIRONMENT MAPPING
# ==========================================================

case "$RUNTIME" in

    local)

        ENV_FILE=".env.local"

        COMPOSE_OVERRIDE="docker-compose.local.yml"

        PROJECT_NAME="shin-local"

        ;;

    stg)

        ENV_FILE=".env.stg"

        COMPOSE_OVERRIDE="docker-compose.stg.yml"

        PROJECT_NAME="shin-stg"

        ;;

    prod)

        ENV_FILE=".env.production"

        COMPOSE_OVERRIDE="docker-compose.prod.yml"

        PROJECT_NAME="shin-prod"

        ;;

    *)

        echo ""
        echo "❌ Unknown runtime: $RUNTIME"
        echo ""
        echo "Supported runtimes:"
        echo "  local"
        echo "  stg"
        echo "  prod"
        echo ""

        exit 1

        ;;

esac

# ==========================================================
# ENVIRONMENT FILE
# ==========================================================

if [ ! -f "$PROJECT_ROOT/$ENV_FILE" ]; then

    echo ""
    echo "❌ Environment file not found"
    echo ""
    echo "RUNTIME  : $RUNTIME"
    echo "ENV_FILE : $ENV_FILE"
    echo "PATH     : $PROJECT_ROOT/$ENV_FILE"
    echo ""

    exit 1

fi

# ==========================================================
# DJANGO SERVICE
# ==========================================================

DJANGO_SERVICE="${DJANGO_SERVICE:-django-v3}"

# ==========================================================
# DEFAULT PIPELINE OPTIONS
# ==========================================================

PIPELINE_LIMIT="${PIPELINE_LIMIT:-10000}"

SEMANTIC_WORKERS="${SEMANTIC_WORKERS:-4}"

# ==========================================================
# MAKER REGISTRY
#
# Maker definitions are NOT hard-coded here.
#
# They are managed by:
#
#   scripts/pc_runtime/makers.tsv
#
# Format:
#
#   maker
#   acquisition_type
#   acquisition_target
#   mid
#   enabled
#
# ==========================================================

MAKER_REGISTRY="$PROJECT_ROOT/scripts/pc_runtime/makers.tsv"

# ==========================================================
# MAKER REGISTRY CHECK
# ==========================================================

if [ ! -f "$MAKER_REGISTRY" ]; then

    echo ""
    echo "❌ Maker registry not found"
    echo ""
    echo "PATH : $MAKER_REGISTRY"
    echo ""

    exit 1

fi

# ==========================================================
# DOCKER COMPOSE
# ==========================================================

COMPOSE=(

    docker compose

    -p "$PROJECT_NAME"

    --env-file
    "$PROJECT_ROOT/$ENV_FILE"

    -f
    "$PROJECT_ROOT/docker-compose.yml"

)

# ==========================================================
# COMPOSE OVERRIDE
# ==========================================================

if [ -n "$COMPOSE_OVERRIDE" ]; then

    COMPOSE+=(

        -f
        "$PROJECT_ROOT/$COMPOSE_OVERRIDE"

    )

fi

# ==========================================================
# RUNTIME INFO
# ==========================================================

echo ""
echo "=========================================================="
echo "🌌 SHIN CORE LINX PC RUNTIME CONFIG"
echo "=========================================================="

echo "RUNTIME             : $RUNTIME"
echo "PROJECT_ROOT        : $PROJECT_ROOT"
echo "ENV_FILE            : $ENV_FILE"
echo "PROJECT_NAME        : $PROJECT_NAME"
echo "DJANGO_SERVICE      : $DJANGO_SERVICE"
echo "PIPELINE_LIMIT      : $PIPELINE_LIMIT"
echo "SEMANTIC_WORKERS    : $SEMANTIC_WORKERS"
echo "MAKER_REGISTRY      : $MAKER_REGISTRY"

echo "=========================================================="