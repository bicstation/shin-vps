#!/bin/bash

# ==========================================================
# SHIN CORE LINX
# PC RUNTIME PIPELINE
# UNIFIED RUNTIME
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
# UNIFIED RUNTIME
# ==========================================================

run_unified_runtime() {

    log "⑦ UNIFIED RUNTIME"

    echo ""
    echo "Rebuilding Unified Runtime..."
    echo ""

    # ------------------------------------------------------
    # Unified Runtime
    # ------------------------------------------------------

    run_django rebuild_unified_runtime

    # ------------------------------------------------------
    # Complete
    # ------------------------------------------------------

    echo ""

    echo "=========================================================="
    echo "✅ UNIFIED RUNTIME COMPLETE"
    echo "=========================================================="

    echo ""

}

# ==========================================================
# DIRECT EXECUTION
#
# unified.sh
# ==========================================================

if [ "${BASH_SOURCE[0]}" = "$0" ]; then

    while [ $# -gt 0 ]
    do

        case "$1" in

            -h|--help)

                echo ""
                echo "SHIN CORE LINX"
                echo "Unified Runtime Rebuild"
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

    run_unified_runtime

fi