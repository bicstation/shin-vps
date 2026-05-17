// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/hooks/useSemanticHierarchy.ts
// ============================================================================

'use client'

import {
  useMemo,
} from 'react'

type Product = {
  id?: number | string

  semantic_role?: string

  semantic_weight?: number
}

/* ============================================================================
🔥 Semantic Hierarchy
============================================================================ */

export type SemanticHierarchy = {

  flagship: Product | null

  discoveryProducts: Product[]

  explorationProducts: Product[]

}

/* ============================================================================
🔥 Sort Semantic Runtime
============================================================================ */

function sortProducts(
  products: Product[]
) {

  return [...products].sort(
    (a, b) =>
      (b.semantic_weight || 0)
      -
      (a.semantic_weight || 0)
  )
}

/* ============================================================================
🔥 Build Hierarchy
============================================================================ */

function buildHierarchy(
  products: Product[]
): SemanticHierarchy {

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (!products.length) {

    return {

      flagship: null,

      discoveryProducts: [],

      explorationProducts: [],

    }
  }

  /* ==========================================================================
  🔥 Semantic Sort
  ========================================================================== */

  const sorted =
    sortProducts(products)

  /* ==========================================================================
  🔥 Hierarchy
  ========================================================================== */

  const flagship =
    sorted[0] || null

  const discoveryProducts =
    sorted.slice(1, 4)

  const explorationProducts =
    sorted.slice(4)

  /* ==========================================================================
  🔥 Return
  ========================================================================== */

  return {

    flagship,

    discoveryProducts,

    explorationProducts,

  }
}

/* ============================================================================
🔥 useSemanticHierarchy
============================================================================ */

export default function useSemanticHierarchy(
  products: Product[] = []
) {

  return useMemo(

    () =>
      buildHierarchy(
        products
      ),

    [products]

  )
}