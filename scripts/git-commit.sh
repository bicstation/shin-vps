#!/bin/bash
# ============================================================================
# FILE:
# scripts/git-commit.sh
#
# SHIN CORE LINX
# Git Runtime
#
# Responsibilities
#
# - Git Commit
# - Git Push
# - Tag Deploy
# - GitHub Actions Runtime
# - Deploy Monitor
# - Health Check
#
# Local Development Only
# ============================================================================

set -euo pipefail

# ============================================================================
# Runtime Constants
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CURRENT_HOST="$(hostname)"
CURRENT_USER="$USER"

PROJECT_NAME="shin-vps"

DEFAULT_BRANCH="main"

WORKFLOW_NAME="SHIN CORE LINX｜Production Deploy"

# ============================================================================
# Runtime Colors
# ============================================================================

RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
CYAN="\033[36m"
BOLD="\033[1m"
RESET="\033[0m"

# ============================================================================
# Banner
# ============================================================================

banner() {

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌌 SHIN CORE LINX"
echo "Git Deploy Runtime"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

}

# ============================================================================
# Error
# ============================================================================

die() {

echo
echo -e "${RED}❌ $1${RESET}"
echo

exit 1

}

# ============================================================================
# Success
# ============================================================================

success() {

echo
echo -e "${GREEN}✅ $1${RESET}"
echo

}

# ============================================================================
# Warning
# ============================================================================

warning() {

echo
echo -e "${YELLOW}⚠ $1${RESET}"
echo

}

# ============================================================================
# Runtime Banner
# ============================================================================

banner

# ============================================================================
# Prevent Production Execution
# ============================================================================

if [[ "$CURRENT_HOST" == *"x162-43"* ]]; then

die "Production VPS detected.
Run this script from your development machine."

fi

# ============================================================================
# Locate Project
# ============================================================================

if [[ -d "./.git" ]]; then

PROJECT_ROOT="$(pwd)"

elif [[ -d "/home/$CURRENT_USER/shin-dev/shin-vps/.git" ]]; then

PROJECT_ROOT="/home/$CURRENT_USER/shin-dev/shin-vps"

elif [[ -d "/home/$CURRENT_USER/dev/shin-vps/.git" ]]; then

PROJECT_ROOT="/home/$CURRENT_USER/dev/shin-vps"

else

die "Unable to locate Git project."

fi

cd "$PROJECT_ROOT"

# ============================================================================
# Runtime Checks
# ============================================================================

command -v git >/dev/null \
    || die "Git not installed."

command -v ssh >/dev/null \
    || die "SSH not installed."

command -v gh >/dev/null \
    || die "GitHub CLI not installed."

# ============================================================================
# SSH Runtime
# ============================================================================

if ! ssh-add -l >/dev/null 2>&1
then

    eval "$(ssh-agent -s)" >/dev/null

    if [[ -f "$HOME/.ssh/id_ed25519" ]]
    then
        ssh-add "$HOME/.ssh/id_ed25519"
    fi

fi

# ============================================================================
# Branch
# ============================================================================

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

# ============================================================================
# Tag Runtime
# ============================================================================

refresh_tag() {

git fetch --tags -f >/dev/null 2>&1

LATEST_TAG="$(git tag -l "v*" | sort -V | tail -n1)"

if [[ -z "$LATEST_TAG" ]]
then

    LATEST_TAG="v1.0.0"

fi

MAJOR_MINOR="$(echo "$LATEST_TAG" | cut -d. -f1-2)"

PATCH="$(echo "$LATEST_TAG" | cut -d. -f3)"

SUGGESTED_TAG="${MAJOR_MINOR}.$((PATCH + 1))"

}

refresh_tag

# ============================================================================
# Runtime Information
# ============================================================================

echo "Environment : $CURRENT_HOST"
echo "Project     : $PROJECT_NAME"
echo "Directory   : $PROJECT_ROOT"
echo "Branch      : $BRANCH"

echo

echo "Current Tag : $LATEST_TAG"
echo "Next Tag    : $SUGGESTED_TAG"

echo
# ============================================================================
# Git Status
# ============================================================================

STATUS="$(git status --porcelain)"

# ============================================================================
# Commit Runtime
# ============================================================================

if [[ -z "$STATUS" ]]
then

echo "✨ No modified files."

else

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Commit Type"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "1) feat"
echo "2) fix"
echo "3) infra"
echo "4) chore"

echo

read -rp "Select (1-4): " TYPE_NUMBER

case "$TYPE_NUMBER" in

1)
TYPE="feat"
;;

2)
TYPE="fix"
;;

3)
TYPE="infra"
;;

*)
TYPE="chore"
;;

esac

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💬 Commit Message"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "1) SHIN-VPS v3 環境構築とスクリプトの強化"

echo "2) Shared Library の改善"

echo "3) Deploy Runtime 改善"

echo "4) Custom"

echo

read -rp "Select (1-4): " MESSAGE_NUMBER

case "$MESSAGE_NUMBER" in

1)

MESSAGE="SHIN-VPS v3 環境構築とスクリプトの強化"

;;

2)

MESSAGE="Shared Library の改善"

;;

3)

MESSAGE="Deploy Runtime 改善"

;;

*)

read -rp "Message : " MESSAGE

;;

esac

refresh_tag

COMMIT_MESSAGE="[$SUGGESTED_TAG] $TYPE: $MESSAGE"

echo
echo "Commit"
echo "------"
echo "$COMMIT_MESSAGE"
echo

git add -A

git commit \
    -m "$COMMIT_MESSAGE"

git push \
    origin \
    "$BRANCH"

success "Git Push Complete."

fi

# ============================================================================
# Deploy Confirmation
# ============================================================================

echo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo

echo "Tag : $SUGGESTED_TAG"

echo

read -rp "Deploy to Production? (y/N): " DEPLOY

if [[ ! "$DEPLOY" =~ ^[Yy]$ ]]
then

echo
echo "Deployment skipped."
echo

exit 0

fi

# ============================================================================
# Tag Runtime
# ============================================================================

if git rev-parse "$SUGGESTED_TAG" >/dev/null 2>&1
then

die "Tag already exists."

fi

git tag \
    -a "$SUGGESTED_TAG" \
    -m "$COMMIT_MESSAGE"

git push \
    origin \
    "$SUGGESTED_TAG"

success "Tag pushed."
# ============================================================================
# GitHub Actions Runtime
# ============================================================================

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 GitHub Actions Runtime"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

echo "Waiting GitHub Actions..."

sleep 5

# ============================================================================
# Locate Workflow Run
# ============================================================================

RUN_ID=""

for i in {1..12}
do

    RUN_ID="$(
        gh run list \
            --workflow "$WORKFLOW_NAME" \
            --branch "$BRANCH" \
            --limit 1 \
            --json databaseId \
            --jq '.[0].databaseId'
    )"

    if [[ -n "$RUN_ID" && "$RUN_ID" != "null" ]]
    then
        break
    fi

    echo "Waiting Workflow... ($i/12)"

    sleep 5

done

# ============================================================================
# Validation
# ============================================================================

if [[ -z "$RUN_ID" || "$RUN_ID" == "null" ]]
then

    die "Unable to locate GitHub Actions workflow."

fi

echo
echo "Workflow Found"

echo "Run ID : $RUN_ID"

echo

# ============================================================================
# Watch Runtime
# ============================================================================

echo "Watching deployment..."
echo

if gh run watch "$RUN_ID" --exit-status
then

    success "GitHub Actions completed successfully."

else

    die "GitHub Actions failed."

fi

# ============================================================================
# Workflow Summary
# ============================================================================

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Workflow Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

gh run view \
    "$RUN_ID" \
    --json \
    status,\
    conclusion,\
    createdAt,\
    updatedAt,\
    displayTitle

echo

# ============================================================================
# Commit Information
# ============================================================================

CURRENT_COMMIT="$(
git rev-parse --short HEAD
)"

echo "Commit : $CURRENT_COMMIT"

echo "Branch : $BRANCH"

echo "Tag    : $SUGGESTED_TAG"

echo

# ============================================================================
# Deploy Runtime Complete
# ============================================================================

success "Deployment Runtime Complete."

# ============================================================================
# GitHub Actions Runtime
# ============================================================================

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 GitHub Actions Runtime"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

echo "Waiting GitHub Actions..."

sleep 5

# ============================================================================
# Locate Workflow Run
# ============================================================================

RUN_ID=""

for i in {1..12}
do

    RUN_ID="$(
        gh run list \
            --workflow "$WORKFLOW_NAME" \
            --branch "$BRANCH" \
            --limit 1 \
            --json databaseId \
            --jq '.[0].databaseId'
    )"

    if [[ -n "$RUN_ID" && "$RUN_ID" != "null" ]]
    then
        break
    fi

    echo "Waiting Workflow... ($i/12)"

    sleep 5

done

# ============================================================================
# Validation
# ============================================================================

if [[ -z "$RUN_ID" || "$RUN_ID" == "null" ]]
then

    die "Unable to locate GitHub Actions workflow."

fi

echo
echo "Workflow Found"

echo "Run ID : $RUN_ID"

echo

# ============================================================================
# Watch Runtime
# ============================================================================

echo "Watching deployment..."
echo

if gh run watch "$RUN_ID" --exit-status
then

    success "GitHub Actions completed successfully."

else

    die "GitHub Actions failed."

fi

# ============================================================================
# Workflow Summary
# ============================================================================

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Workflow Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

gh run view \
    "$RUN_ID" \
    --json \
    status,\
    conclusion,\
    createdAt,\
    updatedAt,\
    displayTitle

echo

# ============================================================================
# Commit Information
# ============================================================================

CURRENT_COMMIT="$(
git rev-parse --short HEAD
)"

echo "Commit : $CURRENT_COMMIT"

echo "Branch : $BRANCH"

echo "Tag    : $SUGGESTED_TAG"

echo

# ============================================================================
# Deploy Runtime Complete
# ============================================================================

success "Deployment Runtime Complete."
