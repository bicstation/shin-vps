#!/bin/bash

# ============================================================================
# SHIN CORE LINX
# Ranking Experience V2 Structure
# ============================================================================

set -e

ROOT="/home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]"

echo "===================================================="
echo "Creating Ranking Experience V2 Structure"
echo "===================================================="

# ============================================================================
# Components
# ============================================================================

mkdir -p "$ROOT/components"

mkdir -p "$ROOT/components/hero"
mkdir -p "$ROOT/components/breadcrumbs"
mkdir -p "$ROOT/components/flagship"
mkdir -p "$ROOT/components/comparison"
mkdir -p "$ROOT/components/ranking"
mkdir -p "$ROOT/components/faq"
mkdir -p "$ROOT/components/continuation"
mkdir -p "$ROOT/components/debug"
mkdir -p "$ROOT/components/seo"

# ============================================================================
# Hooks
# ============================================================================

mkdir -p "$ROOT/hooks"

# ============================================================================
# Lib
# ============================================================================

mkdir -p "$ROOT/lib"

mkdir -p "$ROOT/lib/hero"
mkdir -p "$ROOT/lib/flagship"
mkdir -p "$ROOT/lib/comparison"
mkdir -p "$ROOT/lib/ranking"
mkdir -p "$ROOT/lib/seo"
mkdir -p "$ROOT/lib/shared"

# ============================================================================
# Styles
# ============================================================================

mkdir -p "$ROOT/styles"

mkdir -p "$ROOT/styles/hero"
mkdir -p "$ROOT/styles/breadcrumbs"
mkdir -p "$ROOT/styles/flagship"
mkdir -p "$ROOT/styles/comparison"
mkdir -p "$ROOT/styles/ranking"
mkdir -p "$ROOT/styles/faq"
mkdir -p "$ROOT/styles/continuation"
mkdir -p "$ROOT/styles/debug"
mkdir -p "$ROOT/styles/seo"

# ============================================================================
# Types
# ============================================================================

mkdir -p "$ROOT/types"

# ============================================================================
# Root Files
# ============================================================================

touch "$ROOT/page.tsx"
touch "$ROOT/RankingSlugPage.module.css"

# ============================================================================
# Components
# ============================================================================

touch "$ROOT/components/index.ts"
touch "$ROOT/components/RankingRuntime.tsx"

touch "$ROOT/components/hero/RankingHero.tsx"

touch "$ROOT/components/breadcrumbs/RankingBreadcrumbs.tsx"

touch "$ROOT/components/flagship/FlagshipCard.tsx"

touch "$ROOT/components/comparison/ComparisonGrid.tsx"
touch "$ROOT/components/comparison/ComparisonCard.tsx"

touch "$ROOT/components/ranking/RankingList.tsx"
touch "$ROOT/components/ranking/RankingListItem.tsx"

touch "$ROOT/components/faq/RankingFAQ.tsx"

touch "$ROOT/components/continuation/RankingContinuation.tsx"

touch "$ROOT/components/debug/RankingDebug.tsx"

touch "$ROOT/components/seo/RankingSEO.tsx"

# ============================================================================
# Hooks
# ============================================================================

touch "$ROOT/hooks/useRuntimeTheme.ts"
touch "$ROOT/hooks/useSemanticHierarchy.ts"

# ============================================================================
# Types
# ============================================================================

touch "$ROOT/types/contracts.ts"

# ============================================================================
# Style Files
# ============================================================================

touch "$ROOT/styles/hero/hero.module.css"

touch "$ROOT/styles/breadcrumbs/breadcrumbs.module.css"

touch "$ROOT/styles/flagship/flagship.module.css"

touch "$ROOT/styles/comparison/comparison.module.css"

touch "$ROOT/styles/ranking/ranking.module.css"

touch "$ROOT/styles/faq/faq.module.css"

touch "$ROOT/styles/continuation/continuation.module.css"

touch "$ROOT/styles/debug/debug.module.css"

touch "$ROOT/styles/seo/seo.module.css"

echo
echo "Completed."
echo
t3 "$ROOT"