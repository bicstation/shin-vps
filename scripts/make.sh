#!/usr/bin/env bash

# =============================================================================
# SHIN CORE LINX
# Ranking Experience V1
# Directory Setup Script
# =============================================================================

set -e

ROOT="/home/maya/shin-dev/shin-vps/next-bicstation/app/ranking"

echo ""
echo "========================================================="
echo " SHIN CORE LINX"
echo " Ranking Experience V1"
echo " Directory Setup"
echo "========================================================="
echo ""

# =============================================================================
# Components
# =============================================================================

mkdir -p "$ROOT/components/common"
mkdir -p "$ROOT/components/hero"
mkdir -p "$ROOT/components/featured"
mkdir -p "$ROOT/components/navigation"
mkdir -p "$ROOT/components/sections"
mkdir -p "$ROOT/components/cards"
mkdir -p "$ROOT/components/footer"

# =============================================================================
# Styles
# =============================================================================

mkdir -p "$ROOT/styles/common"
mkdir -p "$ROOT/styles/hero"
mkdir -p "$ROOT/styles/featured"
mkdir -p "$ROOT/styles/navigation"
mkdir -p "$ROOT/styles/sections"
mkdir -p "$ROOT/styles/cards"
mkdir -p "$ROOT/styles/footer"

# =============================================================================
# Legacy
# =============================================================================

mkdir -p "$ROOT/legacy/components"
mkdir -p "$ROOT/legacy/styles"
mkdir -p "$ROOT/legacy/page"

# =============================================================================
# Safe Copy (Never overwrite)
# =============================================================================

echo ""
echo "Copying current Experience components..."

cp -n "$ROOT/components/Breadcrumb.tsx" \
      "$ROOT/components/common/Breadcrumb.tsx" 2>/dev/null || true

cp -n "$ROOT/components/EmptyRanking.tsx" \
      "$ROOT/components/common/EmptyRanking.tsx" 2>/dev/null || true

cp -n "$ROOT/components/hero/RankingHero.tsx" \
      "$ROOT/components/hero/RankingHero.tsx" 2>/dev/null || true

cp -n "$ROOT/components/featured/FeaturedOverallBanner.tsx" \
      "$ROOT/components/featured/FeaturedOverallBanner.tsx" 2>/dev/null || true

cp -n "$ROOT/components/navigation/RankingNavigation.tsx" \
      "$ROOT/components/navigation/RankingNavigation.tsx" 2>/dev/null || true

cp -n "$ROOT/components/sections/RankingGroupSection.tsx" \
      "$ROOT/components/sections/RankingGroupSection.tsx" 2>/dev/null || true

cp -n "$ROOT/components/RankingCard.tsx" \
      "$ROOT/components/cards/RankingCard.tsx" 2>/dev/null || true

cp -n "$ROOT/components/RankingCardGrid.tsx" \
      "$ROOT/components/cards/RankingCardGrid.tsx" 2>/dev/null || true

# =============================================================================
# CSS
# =============================================================================

echo ""
echo "Copying styles..."

cp -n "$ROOT/styles/hero/hero.module.css" \
      "$ROOT/styles/hero/hero.module.css" 2>/dev/null || true

cp -n "$ROOT/styles/featured/featured.module.css" \
      "$ROOT/styles/featured/featured.module.css" 2>/dev/null || true

cp -n "$ROOT/styles/navigation/navigation.module.css" \
      "$ROOT/styles/navigation/navigation.module.css" 2>/dev/null || true

cp -n "$ROOT/styles/sections/group-section.module.css" \
      "$ROOT/styles/sections/group-section.module.css" 2>/dev/null || true

# =============================================================================
# Complete
# =============================================================================

echo ""
echo "========================================================="
echo " Ranking Experience V1"
echo " Directory setup completed successfully."
echo "========================================================="
echo ""

tree "$ROOT"