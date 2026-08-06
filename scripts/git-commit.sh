#!/bin/bash
# ==============================================================================
# SHIN CORE LINX
# Git Runtime
# ------------------------------------------------------------------------------
# Local Development Runtime
#
# Responsibilities
#
#   • Git Commit
#   • Git Push
#   • Version Tag
#   • Production Deploy
#   • GitHub Actions Runtime Monitor
#
# Reality
#
#   Local → GitHub → GitHub Actions → VPS
#
# ==============================================================================
#
# Version
#
#   SHIN CORE LINX Runtime v4
#
# ==============================================================================

set -euo pipefail

# ==============================================================================
# Runtime Constants
# ==============================================================================

readonly WORKFLOW_NAME="SHIN CORE LINX｜Production Deploy"
readonly DEFAULT_BRANCH="main"

readonly WAIT_SECONDS=5
readonly MAX_WAIT=36

readonly SUCCESS_ICON="✅"
readonly ERROR_ICON="❌"
readonly INFO_ICON="📡"

# ==============================================================================
# Runtime
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

CURRENT_USER="$(whoami)"
CURRENT_HOST="$(hostname)"

# ==============================================================================
# Project Root Detection
# ==============================================================================

detect_project_root() {

    if [[ -d ".git" ]]; then
        pwd
        return
    fi

    if [[ -d "/home/${CURRENT_USER}/shin-vps/.git" ]]; then
        echo "/home/${CURRENT_USER}/shin-vps"
        return
    fi

    if [[ -d "/home/${CURRENT_USER}/dev/shin-vps/.git" ]]; then
        echo "/home/${CURRENT_USER}/dev/shin-vps"
        return
    fi

    if [[ -d "/home/${CURRENT_USER}/shin-dev/shin-vps/.git" ]]; then
        echo "/home/${CURRENT_USER}/shin-dev/shin-vps"
        return
    fi

    echo ""
}

PROJECT_ROOT="$(detect_project_root)"

if [[ -z "${PROJECT_ROOT}" ]]; then

    echo ""
    echo "❌ SHIN CORE LINX Runtime"
    echo ""
    echo "Project Root Not Found."
    echo ""

    exit 1

fi

cd "${PROJECT_ROOT}"

# ==============================================================================
# VPS Protection
# ==============================================================================

if hostname | grep -qi "x162-43"; then

    echo ""
    echo "============================================================"
    echo "❌ PRODUCTION VPS"
    echo "============================================================"
    echo ""
    echo "This Runtime must be executed from Local Environment."
    echo ""

    exit 1

fi

# ==============================================================================
# SSH Agent
# ==============================================================================

prepare_ssh() {

    if ssh-add -l >/dev/null 2>&1; then
        return
    fi

    eval "$(ssh-agent -s)" >/dev/null

    if [[ -f "${HOME}/.ssh/id_ed25519" ]]; then

        ssh-add "${HOME}/.ssh/id_ed25519" >/dev/null

    fi
}

prepare_ssh

# ==============================================================================
# Help
# ==============================================================================

show_help() {

cat <<EOF

============================================================
SHIN CORE LINX Git Runtime
============================================================

Usage

    save
    save rollback
    save -t v1.2.300

Functions

    Commit
    Push
    Version Tag
    Production Deploy
    GitHub Actions Monitor

============================================================

EOF

}

case "${1:-}" in

    -h|--help)

        show_help
        exit 0
        ;;

esac
# ==============================================================================
# Git Runtime
# ==============================================================================

refresh_git() {

    git fetch origin --prune >/dev/null 2>&1 || true
    git fetch --tags --force >/dev/null 2>&1 || true

}

refresh_git

# ==============================================================================
# Branch Runtime
# ==============================================================================

CURRENT_BRANCH="$(
    git rev-parse --abbrev-ref HEAD
)"

# ==============================================================================
# Current Commit
# ==============================================================================

CURRENT_SHA="$(
    git rev-parse HEAD
)"

SHORT_SHA="$(
    git rev-parse --short HEAD
)"

# ==============================================================================
# Latest Version Runtime
# ==============================================================================

LATEST_TAG="$(
    git tag \
        --list "v*" \
        | sort -V \
        | tail -n1
)"

if [[ -z "${LATEST_TAG}" ]]; then

    LATEST_TAG="v1.0.0"

fi

# ==============================================================================
# Next Version Runtime
# ==============================================================================

VERSION_PREFIX="$(
    echo "${LATEST_TAG}" \
    | cut -d. -f1-2
)"

VERSION_PATCH="$(
    echo "${LATEST_TAG}" \
    | cut -d. -f3
)"

SUGGESTED_TAG="${VERSION_PREFIX}.$((VERSION_PATCH + 1))"

# ==============================================================================
# Runtime Override
# ==============================================================================

if [[ "${1:-}" == "-t" ]]; then

    if [[ -n "${2:-}" ]]; then

        SUGGESTED_TAG="${2}"

    fi

fi

# ==============================================================================
# Working Tree
# ==============================================================================

if [[ -n "$(git status --porcelain)" ]]; then

    HAS_CHANGES=true

else

    HAS_CHANGES=false

fi

# ==============================================================================
# Runtime Header
# ==============================================================================

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌌 SHIN CORE LINX Git Runtime"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""

printf "%-12s %s\n" "Project :"  "$(basename "${PROJECT_ROOT}")"
printf "%-12s %s\n" "Branch :"   "${CURRENT_BRANCH}"
printf "%-12s %s\n" "Commit :"   "${SHORT_SHA}"
printf "%-12s %s\n" "Latest :"   "${LATEST_TAG}"
printf "%-12s %s\n" "Next :"     "${SUGGESTED_TAG}"

echo ""

if ${HAS_CHANGES}; then

    echo "Status : Working Tree Modified"

else

    echo "Status : Working Tree Clean"

fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ==============================================================================
# Rollback Runtime
# ==============================================================================

if [[ "${1:-}" == "rollback" ]]; then

    echo ""
    echo "============================================================"
    echo "Rollback Runtime"
    echo "============================================================"

    git tag | sort -V

    echo ""

    read -rp "Rollback Tag : " ROLLBACK_TAG

    if [[ -z "${ROLLBACK_TAG}" ]]; then

        echo ""
        echo "Cancelled."
        exit 0

    fi

    git checkout "${ROLLBACK_TAG}"

    echo ""
    echo "✅ Checkout Complete : ${ROLLBACK_TAG}"
    echo ""

    exit 0

fi

# ==============================================================================
# Commit Runtime
# ==============================================================================

if ! ${HAS_CHANGES}; then

    echo ""
    echo "✨ No Changes."
    echo "Skip Commit."
    echo ""

else

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Commit Type"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1) feat"
    echo "2) fix"
    echo "3) infra"
    echo "4) chore"
    echo ""

    read -rp "Select (1-4): " TYPE

    case "${TYPE}" in

        1) COMMIT_TYPE="feat" ;;
        2) COMMIT_TYPE="fix" ;;
        3) COMMIT_TYPE="infra" ;;
        *) COMMIT_TYPE="chore" ;;

    esac

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Commit Message"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1) SHIN-VPS v3 環境構築とスクリプトの強化"
    echo "2) Shared Library のパス調整と疎通確認"
    echo "3) Free Input"
    echo ""

    read -rp "Select (1-3): " MESSAGE

    case "${MESSAGE}" in

        1)
            COMMIT_MESSAGE="SHIN-VPS v3 環境構築とスクリプトの強化"
            ;;

        2)
            COMMIT_MESSAGE="Shared Library のパス調整と疎通確認"
            ;;

        *)
            read -rp "Message : " COMMIT_MESSAGE
            ;;

    esac

    FULL_MESSAGE="[${SUGGESTED_TAG}] ${COMMIT_TYPE}: ${COMMIT_MESSAGE}"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Git Commit"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    git add -A

    git commit -m "${FULL_MESSAGE}"

    echo ""
    echo "✅ Commit Complete"
    echo ""

fi

# ==============================================================================
# Push Runtime
# ==============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Push Runtime"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

git push origin "${CURRENT_BRANCH}"

echo ""
echo "✅ Branch Push Complete"
echo ""
# ==============================================================================
# Deploy Runtime
# ==============================================================================

if [[ "${CURRENT_BRANCH}" != "${DEFAULT_BRANCH}" ]]; then

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Deploy Runtime"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Current Branch : ${CURRENT_BRANCH}"
    echo ""
    echo "Deploy is only available from:"
    echo ""
    echo "    ${DEFAULT_BRANCH}"
    echo ""
    echo "Skip Deploy."
    echo ""

    exit 0

fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Production Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Version : ${SUGGESTED_TAG}"
echo ""

read -rp "Start GitHub Actions Deploy? (y/N): " DEPLOY_CONFIRM

echo ""

if [[ ! "${DEPLOY_CONFIRM}" =~ ^[Yy]$ ]]; then

    echo "Deploy Cancelled."
    echo ""

    exit 0

fi

# ==============================================================================
# Tag Runtime
# ==============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Tag Runtime"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if git rev-parse "${SUGGESTED_TAG}" >/dev/null 2>&1; then

    echo "❌ Tag already exists."
    echo ""
    echo "${SUGGESTED_TAG}"
    echo ""

    exit 1

fi

TAG_MESSAGE="Deploy ${SUGGESTED_TAG}"

git tag \
    -a "${SUGGESTED_TAG}" \
    -m "${TAG_MESSAGE}"

echo "✅ Tag Created"
echo ""

# ==============================================================================
# Push Tag
# ==============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Push Tag"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

git push origin "${SUGGESTED_TAG}"

echo ""
echo "✅ Tag pushed."
echo ""

# ==============================================================================
# Runtime Preparation
# ==============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 GitHub Actions Runtime"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sleep 3
# ==============================================================================
# GitHub Actions Runtime
# ==============================================================================

echo "Waiting GitHub Actions..."
echo ""

RUN_ID=""

for ((i=1; i<=MAX_WAIT; i++))
do

    echo "Waiting Workflow... (${i}/${MAX_WAIT})"

    RUN_ID="$(
        gh run list \
            --workflow "${WORKFLOW_NAME}" \
            --limit 20 \
            --json databaseId,headSha,status,event \
            --jq '
                map(
                    select(
                        .headSha=="'"${CURRENT_SHA}"'"
                        and
                        .event=="push"
                    )
                )
                | first
                | .databaseId
            ' \
            2>/dev/null
    )"

    if [[ -n "${RUN_ID}" && "${RUN_ID}" != "null" ]]; then

        break

    fi

    sleep "${WAIT_SECONDS}"

done

# ==============================================================================
# Workflow Not Found
# ==============================================================================

if [[ -z "${RUN_ID}" || "${RUN_ID}" == "null" ]]; then

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ GitHub Actions"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    echo "Unable to locate Workflow."

    echo ""
    echo "Commit SHA"
    echo "----------"

    echo "${CURRENT_SHA}"

    echo ""
    echo "You can inspect manually."

    echo ""

    gh run list \
        --workflow "${WORKFLOW_NAME}" \
        --limit 10 \
        || true

    exit 1

fi

# ==============================================================================
# Workflow Found
# ==============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GitHub Actions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Run ID"

echo "------"

echo "${RUN_ID}"

echo ""

# ==============================================================================
# Watch Runtime
# ==============================================================================

echo "Watching Runtime..."
echo ""

gh run watch \
    "${RUN_ID}" \
    --exit-status

RESULT=$?

echo ""

if [[ ${RESULT} -eq 0 ]]; then

    DEPLOY_RESULT="SUCCESS"

else

    DEPLOY_RESULT="FAILED"

fi
# ==============================================================================
# Deployment Summary
# ==============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Deployment Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Project"

echo "-------"

echo "$(basename "${PROJECT_ROOT}")"

echo ""

echo "Branch"

echo "------"

echo "${CURRENT_BRANCH}"

echo ""

echo "Commit"

echo "------"

echo "${SHORT_SHA}"

echo ""

echo "Version"

echo "-------"

echo "${SUGGESTED_TAG}"

echo ""

echo "Workflow"

echo "--------"

echo "${WORKFLOW_NAME}"

echo ""

echo "Run ID"

echo "------"

echo "${RUN_ID}"

echo ""

echo "Result"

echo "------"

echo "${DEPLOY_RESULT}"

echo ""

# ==============================================================================
# Final Result
# ==============================================================================

if [[ "${DEPLOY_RESULT}" == "SUCCESS" ]]; then

    echo "============================================================"
    echo "✅ SHIN CORE LINX DEPLOY SUCCESS"
    echo "============================================================"
    echo ""

    echo "Production Runtime Updated."

    echo ""

    exit 0

fi

echo "============================================================"
echo "❌ SHIN CORE LINX DEPLOY FAILED"
echo "============================================================"
echo ""

echo "GitHub Actions reported an error."

echo ""
echo "Inspect the workflow log."

echo ""

echo "Run"

echo "---"

echo "${RUN_ID}"

echo ""

exit 1