#!/bin/bash

# ==========================================================
# SHIN CORE LINX
# MAKER PRODUCT RUNTIME PIPELINE
#
# First Target : DELL
#
# Flow
#
#   LinkShare FTP
#        ↓
#   DELL Import / Scraping
#        ↓
#   Spec Runtime
#        ↓
#   Human Runtime
#        ↓
#   Semantic Runtime
#        ↓
#   Semantic Refresh
#        ├─ Semantic Authority
#        └─ Unified Runtime
#
# ==========================================================

set -e

export PATH=/usr/local/bin:/usr/bin:/bin

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ==========================================================
# Runtime
# ==========================================================

source "$PROJECT_ROOT/.env.pc"

RUNTIME="local"

# ==========================================================
# Arguments
# ==========================================================

MAKER=""

while [ $# -gt 0 ]
do
    case "$1" in
        --maker)
            if [ -z "${2:-}" ]; then
                echo "❌ --maker requires a value"
                exit 1
            fi

            MAKER="$2"
            shift 2
            ;;
        -h|--help)
            echo ""
            echo "SHIN CORE LINX"
            echo "Maker Product Runtime Pipeline"
            echo ""
            echo "Usage:"
            echo "  $0 --maker dell"
            echo ""
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            exit 1
            ;;
    esac
done

# ==========================================================
# Maker Validation
# ==========================================================

if [ -z "$MAKER" ]; then
    echo "❌ --maker is required"
    exit 1
fi

if [ "$MAKER" != "dell" ]; then
    echo "❌ First version supports only: dell"
    echo "Requested maker : $MAKER"
    exit 1
fi

# ==========================================================
# Environment Mapping
# ==========================================================

if [ "$RUNTIME" = "local" ]; then
    ENV_FILE=".env.local"
    COMPOSE_OVERRIDE="docker-compose.local.yml"
    PROJECT_NAME="shin-local"
else
    echo "❌ Unknown runtime: $RUNTIME"
    exit 1
fi

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

# ==========================================================
# START
# ==========================================================

log "🚀 SHIN CORE LINX MAKER PIPELINE START"

echo ""
echo "MAKER   : $MAKER"
echo "RUNTIME : $RUNTIME"
echo "PROJECT : $PROJECT_NAME"
echo "SERVICE : $DJANGO_SERVICE"
echo ""

# ==========================================================
# ① DELL REALITY ACQUISITION
# ==========================================================

log "① DELL REALITY ACQUISITION"

run_django import_products \
    linkshare ftp 2557

run_django import_products \
    dell

# ==========================================================
# ② SPEC RUNTIME
# ==========================================================

log "② SPEC RUNTIME"

run_django compile_spec_runtime \
    --maker "$MAKER"

# ==========================================================
# ③ HUMAN RUNTIME
# ==========================================================

log "③ HUMAN RUNTIME"

run_django compile_human_runtime \
    --maker "$MAKER" \
    --limit 100

# ==========================================================
# ④ SEMANTIC RUNTIME
# ==========================================================

log "④ SEMANTIC RUNTIME"

run_django compile_semantic_runtime \
    --maker "$MAKER" \
    --needs-runtime \
    --limit 100 \
    --workers 4

# ==========================================================
# ⑤ SEMANTIC REFRESH
# ==========================================================

log "⑤ SEMANTIC REFRESH"

run_django compile_semantic_authority

run_django rebuild_unified_runtime

# ==========================================================
# COMPLETE
# ==========================================================

log "✅ SHIN CORE LINX MAKER PIPELINE COMPLETE"

echo ""
echo "MAKER : $MAKER"
echo ""
echo "✓ DELL REALITY ACQUISITION"
echo "✓ SPEC RUNTIME"
echo "✓ HUMAN RUNTIME"
echo "✓ SEMANTIC RUNTIME"
echo "✓ SEMANTIC AUTHORITY"
echo "✓ UNIFIED RUNTIME"
echo ""