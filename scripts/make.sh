#!/bin/bash
# ============================================================================
# SHIN CORE LINX
# Catalog Experience V1
# Frontend Scaffold
# ============================================================================

BASE="/home/maya/shin-vps/next-bicstation/app/catalog"


echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Creating Catalog Experience V1"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ----------------------------------------------------------------------------
# Directories
# ----------------------------------------------------------------------------

mkdir -p "$BASE/components"
mkdir -p "$BASE/hooks"
mkdir -p "$BASE/styles"
mkdir -p "$BASE/types"

# ----------------------------------------------------------------------------
# Pages
# ----------------------------------------------------------------------------

touch "$BASE/page.tsx"

# ----------------------------------------------------------------------------
# Components
# ----------------------------------------------------------------------------

touch "$BASE/components/Breadcrumb.tsx"

touch "$BASE/components/CatalogHero.tsx"

touch "$BASE/components/CatalogSummary.tsx"

touch "$BASE/components/ProductGrid.tsx"

touch "$BASE/components/ProductCard.tsx"

touch "$BASE/components/Pagination.tsx"

touch "$BASE/components/EmptyProducts.tsx"

# ----------------------------------------------------------------------------
# Hooks
# ----------------------------------------------------------------------------

touch "$BASE/hooks/useCatalog.ts"

# ----------------------------------------------------------------------------
# Types
# ----------------------------------------------------------------------------

touch "$BASE/types/catalog.ts"

# ----------------------------------------------------------------------------
# Styles
# ----------------------------------------------------------------------------

touch "$BASE/styles/catalog.module.css"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Catalog Experience V1 Scaffold Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

tree "$BASE"

