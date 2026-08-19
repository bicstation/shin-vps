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
#   ⓪ Reset Product Stock   ← ALL PRODUCTS / ONCE
#      ↓
#   Maker Loop
#      ├─ ① Reality Acquisition
#      ├─ ② Spec Runtime
#      ├─ ③ Human Runtime
#      └─ ④ Semantic Runtime
#      ↓
#   ⑤ TSV Mapping           ← ALL PRODUCTS / ONCE
#      ↓
#   ⑥ Semantic Authority    ← GLOBAL / ONCE
#      ↓
#   ⑦ Unified Runtime       ← GLOBAL / ONCE
#
# ==========================================================
#
# Modes
#
#   Single Maker:
#
#     $0 --maker dell
#
#   All Enabled Makers:
#
#     $0 --all
#
# Runtime:
#
#     RUNTIME=local $0 --maker dell
#     RUNTIME=stg   $0 --maker dell
#     RUNTIME=prod  $0 --all
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

# source "$SCRIPT_DIR/unified.sh"

# ==========================================================
# ARGUMENTS
# ==========================================================

MAKER=""

RUN_ALL=0

while [ $# -gt 0 ]
do

    case "$1" in

        # --------------------------------------------------
        # SINGLE MAKER
        # --------------------------------------------------

        --maker)

            if [ -z "${2:-}" ]; then

                fail "--maker requires a value"

            fi

            if [ "$RUN_ALL" -eq 1 ]; then

                fail "--maker and --all cannot be used together"

            fi

            MAKER="$2"

            shift 2

            ;;

        # --------------------------------------------------
        # ALL ENABLED MAKERS
        # --------------------------------------------------

        --all)

            if [ -n "$MAKER" ]; then

                fail "--maker and --all cannot be used together"

            fi

            RUN_ALL=1

            shift

            ;;

        # --------------------------------------------------
        # LIMIT
        # --------------------------------------------------

        --limit)

            if [ -z "${2:-}" ]; then

                fail "--limit requires a value"

            fi

            PIPELINE_LIMIT="$2"

            shift 2

            ;;

        # --------------------------------------------------
        # WORKERS
        # --------------------------------------------------

        --workers)

            if [ -z "${2:-}" ]; then

                fail "--workers requires a value"

            fi

            SEMANTIC_WORKERS="$2"

            shift 2

            ;;

        # --------------------------------------------------
        # HELP
        # --------------------------------------------------

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
            echo "  $0 --all"
            echo ""
            echo "  $0 --all --limit 100 --workers 5"
            echo ""
            echo "Runtime:"
            echo ""
            echo "  RUNTIME=local $0 --maker dell"
            echo ""
            echo "  RUNTIME=stg $0 --maker dell"
            echo ""
            echo "  RUNTIME=prod $0 --maker dell"
            echo ""
            echo "  RUNTIME=prod $0 --all"
            echo ""

            exit 0

            ;;

        # --------------------------------------------------
        # UNKNOWN
        # --------------------------------------------------

        *)

            fail "Unknown option: $1"

            ;;

    esac

done

# ==========================================================
# ARGUMENT VALIDATION
# ==========================================================

if [ "$RUN_ALL" -eq 0 ] && [ -z "$MAKER" ]; then

    fail "Either --maker or --all is required"

fi

# ==========================================================
# INITIALIZE
# ==========================================================

initialize_runtime

# ==========================================================
# MAKER VALIDATION
# ==========================================================

if [ "$RUN_ALL" -eq 0 ]; then

    validate_maker "$MAKER"

fi

# ==========================================================
# PIPELINE START TIME
# ==========================================================

PIPELINE_START_TIME="$(
    date '+%Y-%m-%d %H:%M:%S %Z'
)"

PIPELINE_START_EPOCH="$(
    date +%s
)"

# ==========================================================
# PIPELINE START
# ==========================================================

echo ""
echo "=========================================================="
echo "🌌 SHIN CORE LINX PC RUNTIME PIPELINE START"
echo "=========================================================="

echo "START   : $PIPELINE_START_TIME"
echo "RUNTIME : $RUNTIME"
echo "PROJECT : $PROJECT_NAME"
echo "SERVICE : $DJANGO_SERVICE"
echo "LIMIT   : $PIPELINE_LIMIT"
echo "WORKERS : $SEMANTIC_WORKERS"

if [ "$RUN_ALL" -eq 1 ]; then

    echo "MODE    : ALL ENABLED MAKERS"

else

    echo "MODE    : SINGLE MAKER"
    echo "MAKER   : $MAKER"

fi

echo "=========================================================="
echo ""

# ==========================================================
# ⓪ RESET PRODUCT STOCK
#
# IMPORTANT:
#
# This is a GLOBAL operation.
#
# It executes ONCE before any maker acquisition.
#
# Existing logic:
#
#   reset_pc_stock
#
# ==========================================================

log "⓪ RESET PRODUCT STOCK : ALL PRODUCTS"

run_reset_stock

# ==========================================================
# MAKER PIPELINE
# ==========================================================

if [ "$RUN_ALL" -eq 1 ]; then

    # ======================================================
    # ALL ENABLED MAKERS
    #
    # Read makers.tsv directly.
    #
    # Format:
    #
    #   maker
    #   acquisition_type
    #   acquisition_target
    #   mid
    #   enabled
    #
    # Only enabled=1 is executed.
    #
    # ======================================================

    check_maker_registry

    MAKER_COUNT=0

    echo ""
    echo "=========================================================="
    echo "🌌 ENABLED MAKER PIPELINE"
    echo "=========================================================="
    echo ""

    while IFS=$'\t' read -r \
        REGISTRY_MAKER \
        REGISTRY_ACQUISITION_TYPE \
        REGISTRY_ACQUISITION_TARGET \
        REGISTRY_MID \
        REGISTRY_ENABLED
    do

        # --------------------------------------------------
        # Skip empty lines
        # --------------------------------------------------

        if [ -z "$REGISTRY_MAKER" ]; then

            continue

        fi

        # --------------------------------------------------
        # Skip header
        # --------------------------------------------------

        if [ "$REGISTRY_MAKER" = "maker" ]; then

            continue

        fi

        # --------------------------------------------------
        # Skip disabled makers
        # --------------------------------------------------

        if [ "$REGISTRY_ENABLED" != "1" ]; then

            continue

        fi

        MAKER_COUNT=$((MAKER_COUNT + 1))

        # --------------------------------------------------
        # Current Maker
        # --------------------------------------------------

        CURRENT_MAKER="$REGISTRY_MAKER"

        log "🚀 MAKER PIPELINE : ${CURRENT_MAKER^^}"

        echo ""
        echo "MAKER              : $CURRENT_MAKER"
        echo "ACQUISITION TYPE   : $REGISTRY_ACQUISITION_TYPE"
        echo "ACQUISITION TARGET : $REGISTRY_ACQUISITION_TARGET"

        if [ -n "$REGISTRY_MID" ]; then

            echo "MID                : $REGISTRY_MID"

        else

            echo "MID                : <none>"

        fi

        echo "ENABLED            : $REGISTRY_ENABLED"
        echo ""

        # ==================================================
        # ① REALITY ACQUISITION
        # ==================================================

        run_acquisition "$CURRENT_MAKER"

        # ==================================================
        # ② SPEC RUNTIME
        # ==================================================

        run_spec_runtime "$CURRENT_MAKER"

        # ==================================================
        # ③ HUMAN RUNTIME
        # ==================================================

        run_human_runtime "$CURRENT_MAKER"

        # ==================================================
        # ④ SEMANTIC RUNTIME
        # ==================================================

        run_semantic_runtime "$CURRENT_MAKER"

        # ==================================================
        # MAKER COMPLETE
        # ==================================================

        log "✅ MAKER COMPLETE : ${CURRENT_MAKER^^}"

    done < "$MAKER_REGISTRY"

    # ======================================================
    # NO ENABLED MAKERS
    # ======================================================

    if [ "$MAKER_COUNT" -eq 0 ]; then

        fail "No enabled makers found in registry"

    fi

else

    # ======================================================
    # SINGLE MAKER
    # ======================================================

    CURRENT_MAKER="$MAKER"

    log "🚀 MAKER PIPELINE : ${CURRENT_MAKER^^}"

    # ======================================================
    # ① REALITY ACQUISITION
    # ======================================================

    run_acquisition "$CURRENT_MAKER"

    # ======================================================
    # ② SPEC RUNTIME
    # ======================================================

    run_spec_runtime "$CURRENT_MAKER"

    # ======================================================
    # ③ HUMAN RUNTIME
    # ======================================================

    run_human_runtime "$CURRENT_MAKER"

    # ======================================================
    # ④ SEMANTIC RUNTIME
    # ======================================================

    run_semantic_runtime "$CURRENT_MAKER"

fi

# ==========================================================
# ⑤ TSV MAPPING
#
# IMPORTANT:
#
# TSV mapping is GLOBAL.
#
# It executes ONCE after all maker Semantic Runtime
# processing has completed.
#
# ==========================================================

log "⑤ TSV MAPPING : ALL PRODUCTS"

run_tsv_mapping "$MAKER"

# ==========================================================
# ⑥ SEMANTIC AUTHORITY
#
# Global runtime.
#
# Executes ONCE.
#
# ==========================================================

log "⑥ SEMANTIC AUTHORITY : GLOBAL"

run_semantic_authority

# ==========================================================
# ⑦ UNIFIED RUNTIME
#
# Global runtime.
#
# Executes ONCE.
#
# ==========================================================

log "⑦ UNIFIED RUNTIME : GLOBAL"

run_unified_runtime

# ==========================================================
# PIPELINE END TIME
# ==========================================================

PIPELINE_END_TIME="$(
    date '+%Y-%m-%d %H:%M:%S %Z'
)"

PIPELINE_END_EPOCH="$(
    date +%s
)"

PIPELINE_ELAPSED=$((PIPELINE_END_EPOCH - PIPELINE_START_EPOCH))

# ==========================================================
# COMPLETE
# ==========================================================

echo ""
echo "=========================================================="
echo "✅ SHIN CORE LINX PC RUNTIME PIPELINE COMPLETE"
echo "=========================================================="

echo "START   : $PIPELINE_START_TIME"
echo "END     : $PIPELINE_END_TIME"
echo "ELAPSED : ${PIPELINE_ELAPSED} sec"

echo ""

if [ "$RUN_ALL" -eq 1 ]; then

    echo "MODE    : ALL ENABLED MAKERS"
    echo "MAKERS  : $MAKER_COUNT"

else

    echo "MODE    : SINGLE MAKER"
    echo "MAKER   : $MAKER"

fi

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