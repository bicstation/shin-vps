#!/usr/bin/env bash

# ============================================================================
# SHIN CORE LINX
# Discover Experience V2
# Rebuild Directory
# ============================================================================

set -eu

BASE="/home/maya/shin-dev/shin-vps/next-bicstation/app/discover/[semantic-slug]"

echo ""
echo "=========================================="
echo " Discover Experience V2 Rebuild"
echo "=========================================="
echo ""

cd "$BASE"

###############################################################################
# Legacy
###############################################################################

mkdir -p legacy

###############################################################################
# Move old directories
###############################################################################

if [ -d "lib" ]; then
    mv lib legacy/
fi

if [ -f "services/experience.ts" ]; then
    mv services/experience.ts legacy/
fi

if [ -f "dictionary/dictionary.ts" ]; then
    mv dictionary/dictionary.ts legacy/
fi

###############################################################################
# Create directories
###############################################################################

mkdir -p components
mkdir -p dictionary
mkdir -p services
mkdir -p types

###############################################################################
# Dictionary
###############################################################################

touch dictionary/index.ts

###############################################################################
# Example Dictionary
###############################################################################

touch dictionary/usage-gaming.ts

###############################################################################
# Services
###############################################################################

touch services/dictionary.ts

###############################################################################
# Types
###############################################################################

touch types/experience.ts
touch types/dictionary.ts

###############################################################################
# Root
###############################################################################

touch page.tsx
touch loading.tsx
touch not-found.tsx
touch README.md

###############################################################################
# Components
###############################################################################

touch components/Hero.tsx
touch components/About.tsx
touch components/Elements.tsx
touch components/RepresentativeProducts.tsx
touch components/RelatedWorlds.tsx
touch components/ContinueDiscovery.tsx

###############################################################################

echo ""
echo "=========================================="
echo " Discover Experience V2 Ready"
echo "=========================================="

tree .