#!/bin/bash

# ==========================================================
# SHIN CORE LINX
# PC RUNTIME PIPELINE
# REALITY ACQUISITION
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
# MAKER REGISTRY
# ==========================================================

source "$SCRIPT_DIR/makers.sh"

# ==========================================================
# ACQUISITION
# ==========================================================

run_acquisition() {

    local TARGET_MAKER="$1"

    # ------------------------------------------------------
    # Maker Validation
    # ------------------------------------------------------

    if [ -z "$TARGET_MAKER" ]; then

        fail "Maker is required"

    fi

    # ------------------------------------------------------
    # Load Maker Configuration
    # ------------------------------------------------------

    if ! get_maker_config "$TARGET_MAKER"; then

        exit 1

    fi

    # ------------------------------------------------------
    # Acquisition Start
    # ------------------------------------------------------

    log "① ${TARGET_MAKER^^} REALITY ACQUISITION"

    echo ""
    echo "MAKER              : $MAKER"
    echo "ACQUISITION TYPE   : $ACQUISITION_TYPE"
    echo "ACQUISITION TARGET : $ACQUISITION_TARGET"
    echo "MID                : ${MID:-<none>}"
    echo "ENABLED            : $ENABLED"
    echo "RUNTIME            : $RUNTIME"
    echo ""

    # ======================================================
    # ① EXTERNAL REALITY ACQUISITION
    #
    # MID exists:
    #
    #   API / FTP first
    #
    # MID does not exist:
    #
    #   Skip external acquisition
    #
    # ======================================================

    if [ -n "$MID" ]; then

        log "①-A EXTERNAL REALITY ACQUISITION"

        echo ""
        echo "TYPE : $ACQUISITION_TYPE"
        echo "MID  : $MID"
        echo ""

        case "$ACQUISITION_TYPE" in

            linkshare_ftp)

                # --------------------------------------------------
                # Existing proven DELL flow
                # --------------------------------------------------

                run_django import_products \
                    linkshare ftp "$MID"

                ;;

            linkshare_api)

                # --------------------------------------------------
                # LinkShare API
                #
                # Actual Django command contract must match the
                # existing import_products implementation.
                # --------------------------------------------------

                run_django import_products \
                    linkshare api "$MID"

                ;;

            official_api)

                # --------------------------------------------------
                # Official API
                #
                # MID is present, but the current registry/API
                # contract does not yet define a separate command.
                # --------------------------------------------------

                run_django import_products \
                    official api "$MID"

                ;;

            *)

                fail "Unknown acquisition_type: $ACQUISITION_TYPE"

                ;;

        esac

    else

        echo ""
        echo "ℹ️ No MID"
        echo "External API / FTP acquisition skipped."
        echo ""

    fi

    # ======================================================
    # ② MAKER SCRAPING
    #
    # ALWAYS AFTER external acquisition.
    #
    # If MID exists:
    #
    #   API / FTP
    #       ↓
    #   Scraping
    #
    # If MID does not exist:
    #
    #   Scraping only
    #
    # ======================================================

    log "①-B ${TARGET_MAKER^^} SCRAPING"

    echo ""
    echo "TARGET : $ACQUISITION_TARGET"
    echo ""

    run_django import_products \
        "$ACQUISITION_TARGET"

    # ======================================================
    # COMPLETE
    # ======================================================

    echo ""

    echo "=========================================================="
    echo "✅ REALITY ACQUISITION COMPLETE"
    echo "=========================================================="

    echo "MAKER              : $MAKER"
    echo "ACQUISITION TYPE   : $ACQUISITION_TYPE"
    echo "ACQUISITION TARGET : $ACQUISITION_TARGET"
    echo "MID                : ${MID:-<none>}"

    echo "=========================================================="

}

# ==========================================================
# DIRECT EXECUTION
#
# acquisition.sh --maker dell
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

            -h|--help)

                echo ""
                echo "SHIN CORE LINX"
                echo "PC Reality Acquisition"
                echo ""
                echo "Usage:"
                echo ""
                echo "  $0 --maker dell"
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

    run_acquisition "$MAKER"

fi