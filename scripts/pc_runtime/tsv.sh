#!/bin/bash

# ==========================================================
# SHIN CORE LINX
# PC RUNTIME PIPELINE
# TSV MASTER SYNC
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
# TSV ROOT
# ==========================================================

MASTER_DATA_DIR="$PROJECT_ROOT/django/master_data"

CONTAINER_MASTER_DATA_DIR="/usr/src/app/master_data"

# ==========================================================
# ATTRIBUTE TSV
# ==========================================================

ATTRIBUTE_FILES=(

    "attributes.tsv"

)

# ==========================================================
# SEMANTIC MASTER TSV
# ==========================================================

SEMANTIC_FILES=(

    "semantic_aliases.tsv"
    "semantic_negative_aliases.tsv"
    "semantic_normalization_rules.tsv"
    "semantic_groups.tsv"
    "semantic_group_mappings.tsv"
    "semantic_attributes.tsv"
    "semantic_slug_metadata.tsv"
    "semantic_workflow_mappings.tsv"
    "semantic_universes.tsv"

)

# ==========================================================
# TSV COPY
# ==========================================================

copy_tsv() {

    local FILE="$1"

    local SOURCE="$MASTER_DATA_DIR/$FILE"

    local TARGET="$DJANGO_SERVICE:$CONTAINER_MASTER_DATA_DIR/$FILE"

    if [ ! -f "$SOURCE" ]; then

        fail "TSV not found: $SOURCE"

    fi

    echo ""
    echo "📄 COPY : $FILE"

    run_compose_cp \
        "$SOURCE" \
        "$TARGET"

}

# ==========================================================
# SYNC ATTRIBUTE MASTER
# ==========================================================

sync_attribute_master() {

    log "⑤-1 ATTRIBUTE TSV SYNC"

    for FILE in "${ATTRIBUTE_FILES[@]}"
    do

        copy_tsv "$FILE"

    done

    echo ""

    run_django sync_master_attributes

}

# ==========================================================
# SYNC SEMANTIC MASTER
# ==========================================================

sync_semantic_master() {

    log "⑤-2 SEMANTIC TSV SYNC"

    for FILE in "${SEMANTIC_FILES[@]}"
    do

        copy_tsv "$FILE"

    done

}

# ==========================================================
# TSV MAPPING
# ==========================================================

run_tsv_mapping() {

    local MAKER="$1"

    if [ -z "$MAKER" ]; then

        fail "Maker is required"

    fi

    log "⑤ TSV MAPPING"

    echo ""
    echo "MAKER : $MAKER"
    echo ""

    # ------------------------------------------------------
    # Attribute Master
    # ------------------------------------------------------

    sync_attribute_master

    # ------------------------------------------------------
    # Semantic Master
    # ------------------------------------------------------

    sync_semantic_master

    # ------------------------------------------------------
    # Attribute Mapping
    #
    # This operates on the complete Runtime universe.
    #
    # It is intentionally NOT restricted by maker.
    # ------------------------------------------------------

    log "⑤-3 SEMANTIC ATTRIBUTE MAPPING"

    run_django auto_map_attributes_v2

    # ------------------------------------------------------
    # Complete
    # ------------------------------------------------------

    echo ""

    echo "=========================================================="
    echo "✅ TSV MAPPING COMPLETE"
    echo "=========================================================="

    echo "MAKER REQUEST : $MAKER"
    echo "SCOPE         : ALL PRODUCTS"
    echo ""

    echo "=========================================================="

}

# ==========================================================
# DIRECT EXECUTION
#
# tsv.sh --maker dell
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
                echo "PC TSV Master Sync / Mapping"
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

    run_tsv_mapping "$MAKER"

fi