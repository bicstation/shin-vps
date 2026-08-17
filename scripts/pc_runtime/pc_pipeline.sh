#!/bin/bash

# ==========================================================
# SHIN CORE LINX
# PC RUNTIME PIPELINE
# MAIN ORCHESTRATOR
# ==========================================================
#
# Flow
#
#   Pipeline Start
#      ↓
#   ⓪ Reset Product Stock   ← ALL PRODUCTS
#      ↓
#   Maker
#      ↓
#   ① Reality Acquisition
#      ↓
#   ② Spec Runtime
#      ↓
#   ③ Human Runtime
#      ↓
#   ④ Semantic Runtime
#      ↓
#   ⑤ TSV Mapping           ← ALL PRODUCTS
#      ↓
#   ⑥ Semantic Authority    ← ALL PRODUCTS
#      ↓
#   ⑦ Unified Runtime       ← ALL PRODUCTS
#
# ==========================================================

set -e

# ==========================================================
# SCRIPT DIRECTORY
# ==========================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ==========================================================
# LOAD RUNTIME
# ==========================================================

source "$SCRIPT_DIR/config.sh"

source "$SCRIPT_DIR/common.sh"

source "$SCRIPT_DIR/makers.sh"

source "$SCRIPT_DIR/reset_stock.sh"

source "$SCRIPT_DIR/acquisition.sh"

source "$SCRIPT_DIR/spec.sh"

source "$SCRIPT_DIR/human.sh"

source "$SCRIPT_DIR/semantic.sh"

source "$SCRIPT_DIR/tsv.sh"

source "$SCRIPT_DIR/authority.sh"

source "$SCRIPT_DIR/unified.sh"

# ==========================================================
# ARGUMENTS
# ==========================================================

MAKER=""

while [ $# -gt 0 ]
do

    case "$1" in

        --maker)

            if [ -z "${2:-}" ]; then

                fail "--maker requires a value"

            fi

            MAKER="$2"

            shift 2

            ;;

        --limit)

            if [ -z "${2:-}" ]; then

                fail "--limit requires a value"

            fi

            PIPELINE_LIMIT="$2"

            shift 2

            ;;

        --workers)

            if [ -z "${2:-}" ]; then

                fail "--workers requires a value"

            fi

            SEMANTIC_WORKERS="$2"

            shift 2

            ;;

        -h|--help)

            echo ""
            echo "SHIN CORE LINX"
            echo "PC Runtime Pipeline"
            echo ""
            echo "Usage:"
            echo ""
            echo "  $0 --maker dell"
            echo ""
            echo "  $0 --maker dell --limit 100"
            echo ""
            echo "  $0 --maker dell --limit 100 --workers 4"
            echo ""
            echo "Runtime:"
            echo ""
            echo "  RUNTIME=local $0 --maker dell"
            echo ""
            echo "  RUNTIME=stg $0 --maker dell"
            echo ""
            echo "  RUNTIME=prod $0 --maker dell"
            echo ""

            exit 0

            ;;

        *)

            fail "Unknown option: $1"

            ;;

    esac

done

# ==========================================================
# INITIALIZE
# ==========================================================

initialize_runtime

# ==========================================================
# MAKER VALIDATION
# ==========================================================

validate_maker "$MAKER"

# ==========================================================
# START
# ==========================================================

log "🚀 SHIN CORE LINX PC RUNTIME PIPELINE START"

echo ""
echo "MAKER   : $MAKER"
echo "RUNTIME : $RUNTIME"
echo "PROJECT : $PROJECT_NAME"
echo "SERVICE : $DJANGO_SERVICE"
echo "LIMIT   : $PIPELINE_LIMIT"
echo "WORKERS : $SEMANTIC_WORKERS"
echo ""

# ==========================================================
# ⓪ RESET PRODUCT STOCK
#
# IMPORTANT:
#
# This is a GLOBAL operation.
#
# The maker filter does NOT apply here.
#
# Existing logic:
#
#   reset_pc_stock
#
# must execute BEFORE Reality Acquisition.
#
# ==========================================================

run_reset_stock

# ==========================================================
# ① REALITY ACQUISITION
# ==========================================================

run_acquisition "$MAKER"

# ==========================================================
# ② SPEC RUNTIME
# ==========================================================

run_spec_runtime "$MAKER"

# ==========================================================
# ③ HUMAN RUNTIME
# ==========================================================

run_human_runtime "$MAKER"

# ==========================================================
# ④ SEMANTIC RUNTIME
# ==========================================================

run_semantic_runtime "$MAKER"

# ==========================================================
# ⑤ TSV MAPPING
#
# IMPORTANT:
#
# Maker is only the pipeline trigger.
#
# TSV mapping itself targets ALL PRODUCTS.
#
# ==========================================================

run_tsv_mapping "$MAKER"

# ==========================================================
# ⑥ SEMANTIC AUTHORITY
#
# Global runtime.
# No maker filter.
#
# ==========================================================

run_semantic_authority

# ==========================================================
# ⑦ UNIFIED RUNTIME
#
# Global runtime.
# No maker filter.
#
# ==========================================================

run_unified_runtime

# ==========================================================
# COMPLETE
# ==========================================================

log "✅ SHIN CORE LINX PC RUNTIME PIPELINE COMPLETE"

echo ""
echo "MAKER : $MAKER"
echo ""
echo "✓ PRODUCT STOCK RESET : ALL PRODUCTS"
echo "✓ REALITY ACQUISITION"
echo "✓ SPEC RUNTIME"
echo "✓ HUMAN RUNTIME"
echo "✓ SEMANTIC RUNTIME"
echo "✓ TSV MAPPING       : ALL PRODUCTS"
echo "✓ SEMANTIC AUTHORITY: GLOBAL"
echo "✓ UNIFIED RUNTIME   : GLOBAL"
echo ""
echo "=========================================================="