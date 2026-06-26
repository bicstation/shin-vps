#!/bin/bash
# ============================================================================
# SHIN CORE LINX
# Ranking Experience V2
# Frontend Scaffold
# ============================================================================

BASE="/home/maya/shin-dev/shin-vps/next-bicstation/app/ranking"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Creating Ranking Experience V2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ----------------------------------------------------------------------------
# Directories
# ----------------------------------------------------------------------------

mkdir -p "$BASE/components"
mkdir -p "$BASE/hooks"
mkdir -p "$BASE/styles"
mkdir -p "$BASE/types"

# ----------------------------------------------------------------------------
# Page
# ----------------------------------------------------------------------------

touch "$BASE/page.tsx"

# ----------------------------------------------------------------------------
# Components
# ----------------------------------------------------------------------------

touch "$BASE/components/Breadcrumb.tsx"

touch "$BASE/components/RankingHero.tsx"

touch "$BASE/components/FeaturedRanking.tsx"

touch "$BASE/components/RankingTabs.tsx"

touch "$BASE/components/RankingSummary.tsx"

touch "$BASE/components/RankingGrid.tsx"

touch "$BASE/components/RankingCard.tsx"

touch "$BASE/components/EmptyRanking.tsx"

# ----------------------------------------------------------------------------
# Hooks
# ----------------------------------------------------------------------------

touch "$BASE/hooks/useRanking.ts"

# ----------------------------------------------------------------------------
# Types
# ----------------------------------------------------------------------------

touch "$BASE/types/ranking.ts"

# ----------------------------------------------------------------------------
# Styles
# ----------------------------------------------------------------------------

touch "$BASE/styles/ranking.module.css"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Ranking Experience V2 Scaffold Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

tree "$BASE"