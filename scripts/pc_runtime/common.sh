#!/bin/bash

# ==========================================================
# SHIN CORE LINX
# PC RUNTIME PIPELINE
# COMMON RUNTIME FUNCTIONS
# ==========================================================

# ==========================================================
# CONFIGURATION
# ==========================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/config.sh"

# ==========================================================
# LOGGER
# ==========================================================

log() {

    echo ""

    echo "=========================================================="

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"

    echo "=========================================================="

}

# ==========================================================
# DJANGO WRAPPER
# ==========================================================

run_django() {

    "${COMPOSE[@]}" \
        exec -T \
        "$DJANGO_SERVICE" \
        python3 manage.py \
        "$@"

}

# ==========================================================
# DJANGO RAW COMMAND
# ==========================================================

run_django_raw() {

    "${COMPOSE[@]}" \
        exec -T \
        "$DJANGO_SERVICE" \
        "$@"

}

# ==========================================================
# COMPOSE EXEC
# ==========================================================

run_compose_exec() {

    "${COMPOSE[@]}" \
        exec -T \
        "$@"

}

# ==========================================================
# COMPOSE CP
# ==========================================================

run_compose_cp() {

    "${COMPOSE[@]}" \
        cp \
        "$@"

}

# ==========================================================
# INTERNAL API CHECK
# ==========================================================

check_api() {

    local URL="$1"

    if [ -z "$URL" ]; then

        echo ""
        echo "❌ API URL is required"
        echo ""

        return 1

    fi

    log "📡 API CHECK: $URL"

    local RESPONSE

    RESPONSE=$(
        "${COMPOSE[@]}" \
            exec -T \
            "$DJANGO_SERVICE" \
            curl -s \
            "$URL"
    )

    echo "$RESPONSE" | head -c 1000

    echo ""

    # ------------------------------------------------------
    # Empty Response
    # ------------------------------------------------------

    if [ -z "$RESPONSE" ]; then

        echo ""
        echo "❌ ERROR: Empty API response"
        echo ""

        return 1

    fi

    # ------------------------------------------------------
    # Empty Array
    # ------------------------------------------------------

    if [ "$RESPONSE" = "[]" ]; then

        echo ""
        echo "❌ ERROR: API returned empty list"
        echo ""

        return 1

    fi

    return 0

}

# ==========================================================
# RUNTIME INFORMATION
# ==========================================================

show_runtime_info() {

    echo ""

    echo "=========================================================="
    echo "🌌 SHIN CORE LINX PC RUNTIME"
    echo "=========================================================="

    echo "RUNTIME            : $RUNTIME"
    echo "PROJECT_ROOT       : $PROJECT_ROOT"
    echo "ENV_FILE           : $ENV_FILE"
    echo "PROJECT_NAME       : $PROJECT_NAME"
    echo "DJANGO_SERVICE     : $DJANGO_SERVICE"
    echo "PIPELINE_LIMIT     : $PIPELINE_LIMIT"
    echo "SEMANTIC_WORKERS   : $SEMANTIC_WORKERS"

    echo "=========================================================="

    echo ""

}

# ==========================================================
# COMMAND FAILURE
# ==========================================================

fail() {

    echo ""
    echo "❌ $1"
    echo ""

    exit 1

}

# ==========================================================
# COMMAND CHECK
# ==========================================================

require_command() {

    local COMMAND="$1"

    if ! command -v "$COMMAND" >/dev/null 2>&1; then

        fail "Required command not found: $COMMAND"

    fi

}

# ==========================================================
# DOCKER CHECK
# ==========================================================

check_docker() {

    require_command docker

    if ! docker info >/dev/null 2>&1; then

        fail "Docker is not available"

    fi

}

# ==========================================================
# COMPOSE CHECK
# ==========================================================

check_compose() {

    if ! docker compose version >/dev/null 2>&1; then

        fail "Docker Compose is not available"

    fi

}

# ==========================================================
# RUNTIME CHECK
# ==========================================================

check_runtime() {

    check_docker

    check_compose

    if [ ! -f "$PROJECT_ROOT/$ENV_FILE" ]; then

        fail \
            "Environment file not found: $PROJECT_ROOT/$ENV_FILE"

    fi

}

# ==========================================================
# MAKER CHECK
# ==========================================================

is_supported_maker() {

    local TARGET_MAKER="$1"

    for MAKER in "${MAKERS[@]}"
    do

        if [ "$MAKER" = "$TARGET_MAKER" ]; then

            return 0

        fi

    done

    return 1

}

# ==========================================================
# COMMON INITIALIZATION
# ==========================================================

initialize_runtime() {

    check_runtime

    show_runtime_info

}