#!/usr/bin/env bash

set -e

ROOT="/home/maya/shin-dev/shin-vps/django"

REVIEWS="${ROOT}/visualization/reviews"

echo "========================================"
echo " SHIN CORE LINX"
echo " TSV Semantic Authority Team"
echo " Review Workspace Setup"
echo "========================================"
echo

#
# Root
#

mkdir -p "${REVIEWS}"

#
# README
#

cat > "${REVIEWS}/README.md" <<'EOF'
# TSV Semantic Authority Team

This directory is the working area for Semantic Reality reviews.

Standard Workflow

Observe Reality
    ↓
Review Reality
    ↓
Improvement Proposal
    ↓
Commander Review
    ↓
Commander Approval
    ↓
TSV Update
EOF

#
# Universe Reviews
#

UNIVERSES=(
    usage
    device
    gpu
    cpu
    memory
    storage
    monitor
    maker
    adult
)

for UNIVERSE in "${UNIVERSES[@]}"; do

    DIR="${REVIEWS}/universes/${UNIVERSE}"

    mkdir -p "${DIR}"

    #
    # review.md
    #

    cat > "${DIR}/review.md" <<EOF
# Review

Universe: ${UNIVERSE}

## Current Reality

-

## Observations

-

## Strengths

-

## Concerns

-

## Keep As-Is

-

EOF

    #
    # proposal.md
    #

    cat > "${DIR}/proposal.md" <<EOF
# Proposal

Universe: ${UNIVERSE}

Status: Draft

## Improvement Proposals

-

## Reason

-

## Commander Decision

Pending

EOF

done

echo
echo "Review workspace created."
echo
echo "${REVIEWS}"
echo
echo "Done."