#!/bin/bash

# ==========================================================
# SHIN CORE LINX
# PC RUNTIME PIPELINE
# SEMANTIC RUNTIME
# ==========================================================

# ==========================================================
# SCRIPT DIRECTORY
# ==========================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ==========================================================
# COMMON RUNTIME
# ==========================================================

source "$SCRIPT_DIR/common.sh"

# ==========================================================
# SEMANTIC RUNTIME
# ==========================================================

run_semantic_runtime() {

    local MAKER="$1"

    # ------------------------------------------------------
    # Maker Validation
    # ------------------------------------------------------

    if [ -z "$MAKER" ]; then

        fail "Maker is required"

    fi

    # ------------------------------------------------------
    # Start
    # ------------------------------------------------------

    log "④ SEMANTIC RUNTIME"

    echo ""
    echo "MAKER   : $MAKER"
    echo "LIMIT   : $PIPELINE_LIMIT"
    echo "WORKERS : $SEMANTIC_WORKERS"
    echo ""

    # ------------------------------------------------------
    # Semantic Runtime
    # ------------------------------------------------------

    run_django compile_semantic_runtime \
        --maker "$MAKER" \
        --needs-runtime \
        --limit "$PIPELINE_LIMIT" \
        --workers "$SEMANTIC_WORKERS"

    # ------------------------------------------------------
    # Complete
    # ------------------------------------------------------

    echo ""

    echo "=========================================================="
    echo "✅ SEMANTIC RUNTIME COMPLETE"
    echo "=========================================================="

    echo "MAKER : $MAKER"

    echo "=========================================================="

}

# ==========================================================
# DIRECT EXECUTION
#
# semantic.sh --maker dell
# ==========================================================

if [ "${BASH_SOURCE[0]}" = "$0" ]; then

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
                echo "PC Semantic Runtime"
                echo ""
                echo "Usage:"
                echo ""
                echo "  $0 --maker dell"
                echo ""
                echo "  $0 --maker dell --limit 100"
                echo ""
                echo "  $0 --maker dell --limit 100 --workers 4"
                echo ""

                exit 0

                ;;

            *)

                fail "Unknown option: $1"

                ;;

        esac

    done

    if [ -z "$MAKER" ]; then

        fail "--maker is required"

    fi

    initialize_runtime

    run_semantic_runtime "$MAKER"

fi