#!/bin/bash

# ==========================================================
# SHIN CORE LINX
# PC RUNTIME PIPELINE
# SEMANTIC AUTHORITY
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
# SEMANTIC AUTHORITY
# ==========================================================

run_semantic_authority() {

    log "⑥ SEMANTIC AUTHORITY"

    echo ""
    echo "Rebuilding Semantic Authority..."
    echo ""

    # ------------------------------------------------------
    # Semantic Authority
    # ------------------------------------------------------

    run_django compile_semantic_authority

    # ------------------------------------------------------
    # Complete
    # ------------------------------------------------------

    echo ""

    echo "=========================================================="
    echo "✅ SEMANTIC AUTHORITY COMPLETE"
    echo "=========================================================="

    echo ""

}

# ==========================================================
# DIRECT EXECUTION
#
# authority.sh
# ==========================================================

if [ "${BASH_SOURCE[0]}" = "$0" ]; then

    while [ $# -gt 0 ]
    do

        case "$1" in

            -h|--help)

                echo ""
                echo "SHIN CORE LINX"
                echo "Semantic Authority Runtime"
                echo ""
                echo "Usage:"
                echo ""
                echo "  $0"
                echo ""

                exit 0

                ;;

            *)

                fail "Unknown option: $1"

                ;;

        esac

    done

    initialize_runtime

    run_semantic_authority

fi