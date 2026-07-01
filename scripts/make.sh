#!/usr/bin/env bash

BASE="/home/maya/shin-vps/next-bicstation/app/discover/[semantic-slug]"

mkdir -p "$BASE/components/common"
mkdir -p "$BASE/components/Hero"
mkdir -p "$BASE/components/About"
mkdir -p "$BASE/components/Elements"
mkdir -p "$BASE/components/Products"
mkdir -p "$BASE/components/RelatedWorlds"
mkdir -p "$BASE/components/ContinueDiscovery"

mkdir -p "$BASE/dictionary"
mkdir -p "$BASE/services"
mkdir -p "$BASE/styles"
mkdir -p "$BASE/types"

touch "$BASE/page.tsx"
touch "$BASE/loading.tsx"
touch "$BASE/not-found.tsx"
touch "$BASE/README.md"

touch "$BASE/services/dictionary.ts"
touch "$BASE/services/experience.ts"

touch "$BASE/types/dictionary.ts"
touch "$BASE/types/experience.ts"