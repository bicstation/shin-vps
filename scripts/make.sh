#!/bin/bash

BASE="/home/maya/shin-vps/next-bicstation/app/pc-finder"

mkdir -p "$BASE"

mkdir -p "$BASE/components"
mkdir -p "$BASE/hooks"
mkdir -p "$BASE/lib"
mkdir -p "$BASE/styles"
mkdir -p "$BASE/types"
mkdir -p "$BASE/states"
mkdir -p "$BASE/assets"

mkdir -p "$BASE/sections/hero"
mkdir -p "$BASE/sections/intent"
mkdir -p "$BASE/sections/budget"
mkdir -p "$BASE/sections/search"
mkdir -p "$BASE/sections/recommendation"
mkdir -p "$BASE/sections/results"
mkdir -p "$BASE/sections/ranking"

touch "$BASE/page.tsx"
touch "$BASE/loading.tsx"
touch "$BASE/error.tsx"

touch "$BASE/styles/pcFinder.module.css"

touch "$BASE/types/finder.ts"

touch "$BASE/hooks/useFinder.ts"
touch "$BASE/hooks/useFinderState.ts"

touch "$BASE/lib/finderActions.ts"

touch "$BASE/states/FinderLoading.tsx"
touch "$BASE/states/FinderEmpty.tsx"
touch "$BASE/states/FinderError.tsx"

touch "$BASE/components/HeroAssistant.tsx"
touch "$BASE/components/IntentCard.tsx"
touch "$BASE/components/BudgetButton.tsx"
touch "$BASE/components/SearchButton.tsx"
touch "$BASE/components/RecommendationReason.tsx"
touch "$BASE/components/ProductCard.tsx"
touch "$BASE/components/RankingCTA.tsx"

touch "$BASE/sections/hero/HeroSection.tsx"
touch "$BASE/sections/hero/HeroSection.module.css"

touch "$BASE/sections/intent/IntentSection.tsx"
touch "$BASE/sections/intent/IntentSection.module.css"

touch "$BASE/sections/budget/BudgetSection.tsx"
touch "$BASE/sections/budget/BudgetSection.module.css"

touch "$BASE/sections/search/SearchSection.tsx"
touch "$BASE/sections/search/SearchSection.module.css"

touch "$BASE/sections/recommendation/RecommendationSection.tsx"
touch "$BASE/sections/recommendation/RecommendationSection.module.css"

touch "$BASE/sections/results/ResultsSection.tsx"
touch "$BASE/sections/results/ResultsSection.module.css"

touch "$BASE/sections/ranking/RankingSection.tsx"
touch "$BASE/sections/ranking/RankingSection.module.css"

echo "==========================================="
echo " SHIN CORE LINX Finder Structure Created"
echo "==========================================="

tree "$BASE"