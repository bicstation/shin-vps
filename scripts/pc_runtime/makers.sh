#!/bin/bash

# ==========================================================
# SHIN CORE LINX
# PC RUNTIME PIPELINE
# MAKER MANAGEMENT
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
#
# File:
#
#   makers.tsv
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

MAKER_REGISTRY="$SCRIPT_DIR/makers.tsv"

# ==========================================================
# CHECK REGISTRY
# ==========================================================

check_maker_registry() {

    if [ ! -f "$MAKER_REGISTRY" ]; then

        fail "Maker registry not found: $MAKER_REGISTRY"

    fi

}

# ==========================================================
# GET MAKER CONFIG
#
# Result:
#
#   MAKER
#   ACQUISITION_TYPE
#   ACQUISITION_TARGET
#   MID
#   ENABLED
#
# ==========================================================

get_maker_config() {

    local TARGET_MAKER="$1"

    if [ -z "$TARGET_MAKER" ]; then

        fail "Maker is required"

    fi

    check_maker_registry

    local REGISTRY_LINE=""

    # ------------------------------------------------------
    # Find maker
    #
    # IMPORTANT:
    #
    # Do NOT use:
    #
    #   IFS=$'\t' read ...
    #
    # because an empty MID field would collapse.
    #
    # We use "|" internally as a temporary delimiter.
    #
    # ------------------------------------------------------

    REGISTRY_LINE="$(
        awk -F '\t' \
            -v target="$TARGET_MAKER" '
                NR > 1 && $1 == target {
                    printf "%s|%s|%s|%s|%s",
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    exit
                }
            ' \
            "$MAKER_REGISTRY"
    )"

    # =====================================================
    # NOT FOUND
    # =====================================================

    if [ -z "$REGISTRY_LINE" ]; then

        echo ""
        echo "❌ Maker not found in registry"
        echo ""
        echo "Maker : $TARGET_MAKER"
        echo ""
        echo "Registry:"
        echo "  $MAKER_REGISTRY"
        echo ""

        return 1

    fi

    # ------------------------------------------------------
    # Parse registry
    #
    # "|" is NOT an IFS whitespace character, so empty
    # fields are preserved.
    #
    # Example:
    #
    # geekom|official_api|geekom||1
    #
    # becomes:
    #
    # MAKER=geekom
    # ACQUISITION_TYPE=official_api
    # ACQUISITION_TARGET=geekom
    # MID=
    # ENABLED=1
    #
    # ------------------------------------------------------

    IFS='|' read -r \
        MAKER \
        ACQUISITION_TYPE \
        ACQUISITION_TARGET \
        MID \
        ENABLED \
        <<< "$REGISTRY_LINE"

    # =====================================================
    # REGISTRY VALIDATION
    # =====================================================

    if [ -z "$MAKER" ]; then

        echo ""
        echo "❌ Invalid maker registry"
        echo ""
        echo "Target : $TARGET_MAKER"
        echo ""

        return 1

    fi

    if [ -z "$ACQUISITION_TYPE" ]; then

        echo ""
        echo "❌ Acquisition type is empty"
        echo ""
        echo "Maker : $MAKER"
        echo ""

        return 1

    fi

    if [ -z "$ACQUISITION_TARGET" ]; then

        echo ""
        echo "❌ Acquisition target is empty"
        echo ""
        echo "Maker : $MAKER"
        echo ""

        return 1

    fi

    # =====================================================
    # ENABLED VALIDATION
    # =====================================================

    case "$ENABLED" in

        1)

            ;;

        0)

            echo ""
            echo "❌ Maker is disabled"
            echo ""
            echo "Maker   : $MAKER"
            echo "Enabled : $ENABLED"
            echo ""

            return 1

            ;;

        "")

            echo ""
            echo "❌ Maker registry is invalid"
            echo ""
            echo "Maker   : $MAKER"
            echo "Enabled : <empty>"
            echo ""
            echo "Registry:"
            echo "  $MAKER_REGISTRY"
            echo ""

            return 1

            ;;

        *)

            echo ""
            echo "❌ Invalid enabled value"
            echo ""
            echo "Maker   : $MAKER"
            echo "Enabled : $ENABLED"
            echo ""
            echo "Expected:"
            echo "  1 = enabled"
            echo "  0 = disabled"
            echo ""

            return 1

            ;;

    esac

    return 0

}

# ==========================================================
# VALIDATE MAKER
# ==========================================================

validate_maker() {

    local TARGET_MAKER="$1"

    if [ -z "$TARGET_MAKER" ]; then

        fail "Maker is required"

    fi

    if ! get_maker_config "$TARGET_MAKER"; then

        exit 1

    fi

}

# ==========================================================
# LIST MAKERS
# ==========================================================

list_makers() {

    check_maker_registry

    echo ""

    echo "=========================================================="
    echo "SHIN CORE LINX MAKER REGISTRY"
    echo "=========================================================="

    printf "%-12s %-18s %-20s %-8s %-8s\n" \
        "MAKER" \
        "TYPE" \
        "TARGET" \
        "MID" \
        "ENABLED"

    echo "----------------------------------------------------------"

    # ------------------------------------------------------
    # Use awk directly.
    #
    # This preserves empty MID fields correctly.
    #
    # ------------------------------------------------------

    awk -F '\t' '

        NR == 1 {
            next
        }

        NF == 0 {
            next
        }

        {
            printf "%-12s %-18s %-20s %-8s %-8s\n",
                $1,
                $2,
                $3,
                $4,
                $5
        }

    ' "$MAKER_REGISTRY"

    echo "=========================================================="

    echo ""

}

# ==========================================================
# SHOW MAKER
# ==========================================================

show_maker() {

    local TARGET_MAKER="$1"

    if [ -z "$TARGET_MAKER" ]; then

        fail "--show requires a maker"

    fi

    if ! get_maker_config "$TARGET_MAKER"; then

        exit 1

    fi

    echo ""

    echo "=========================================================="
    echo "SHIN CORE LINX MAKER"
    echo "=========================================================="

    echo "MAKER              : $MAKER"
    echo "ACQUISITION TYPE   : $ACQUISITION_TYPE"
    echo "ACQUISITION TARGET : $ACQUISITION_TARGET"
    echo "MID                : ${MID:-<none>}"
    echo "ENABLED            : $ENABLED"

    echo "=========================================================="

    echo ""

}

# ==========================================================
# DIRECT EXECUTION
# ==========================================================

if [ "${BASH_SOURCE[0]}" = "$0" ]; then

    case "${1:-}" in

        --list)

            initialize_runtime

            list_makers

            ;;

        --check)

            if [ -z "${2:-}" ]; then

                fail "--check requires a maker"

            fi

            initialize_runtime

            validate_maker "$2"

            echo ""
            echo "✅ Supported maker : $2"
            echo ""

            ;;

        --show)

            if [ -z "${2:-}" ]; then

                fail "--show requires a maker"

            fi

            initialize_runtime

            show_maker "$2"

            ;;

        -h|--help)

            echo ""
            echo "SHIN CORE LINX"
            echo "Maker Management"
            echo ""
            echo "Usage:"
            echo ""
            echo "  $0 --list"
            echo ""
            echo "  $0 --check dell"
            echo ""
            echo "  $0 --show dell"
            echo ""

            ;;

        *)

            echo ""
            echo "❌ Unknown option"
            echo ""
            echo "Use:"
            echo ""
            echo "  $0 --list"
            echo "  $0 --check dell"
            echo "  $0 --show dell"
            echo ""

            exit 1

            ;;

    esac

fi