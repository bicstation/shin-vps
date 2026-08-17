#!/bin/bash

# ==========================================================
# SHIN CORE LINX
# PC RUNTIME PIPELINE
# HUMAN RUNTIME
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
# HUMAN RUNTIME
# ==========================================================

run_human_runtime() {

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

    log "③ HUMAN RUNTIME"

    echo ""
    echo "MAKER : $MAKER"
    echo "LIMIT : $PIPELINE_LIMIT"
    echo ""

    # ------------------------------------------------------
    # AI Human Runtime
    # ------------------------------------------------------

    run_django compile_human_runtime \
        --maker "$MAKER" \
        --limit "$PIPELINE_LIMIT"

    # ------------------------------------------------------
    # Complete
    # ------------------------------------------------------

    echo ""

    echo "=========================================================="
    echo "✅ HUMAN RUNTIME COMPLETE"
    echo "=========================================================="

    echo "MAKER : $MAKER"

    echo "=========================================================="

}

# ==========================================================
# DIRECT EXECUTION
#
# human.sh --maker dell
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

            -h|--help)

                echo ""
                echo "SHIN CORE LINX"
                echo "PC Human Runtime"
                echo ""
                echo "Usage:"
                echo ""
                echo "  $0 --maker dell"
                echo ""
                echo "  $0 --maker dell --limit 100"
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

    run_human_runtime "$MAKER"

fi