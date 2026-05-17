// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/lib/buildDiscoveryHierarchy.ts
// ============================================================================

type Product = {
  id?: number | string

  semantic_role?: string

  semantic_weight?: number
}

/* ============================================================================
🔥 Discovery Hierarchy
============================================================================ */

export type DiscoveryHierarchy = {

  flagship: Product | null

  discoveryProducts: Product[]

  explorationProducts: Product[]

}

/* ============================================================================
🔥 Sort Semantic Products
============================================================================ */

function sortSemanticProducts(
  products: Product[]
): Product[] {

  return [...products].sort(
    (a, b) =>
      (b.semantic_weight || 0)
      -
      (a.semantic_weight || 0)
  )
}

/* ============================================================================
🔥 Build Discovery Hierarchy
============================================================================ */

export function buildDiscoveryHierarchy(
  products: Product[] = []
): DiscoveryHierarchy {

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

  const sortedProducts =
    sortSemanticProducts(
      products
    )

  /* ==========================================================================
  🔥 Semantic Flagship
  ========================================================================== */

  const flagship =
    sortedProducts[0]
    || null

  /* ==========================================================================
  🔥 Discovery Grid
  ========================================================================== */

  const discoveryProducts =
    sortedProducts.slice(
      1,
      4
    )

  /* ==========================================================================
  🔥 Exploration Runtime
  ========================================================================== */

  const explorationProducts =
    sortedProducts.slice(4)

  /* ==========================================================================
  🔥 Return
  ========================================================================== */

  return {

    flagship,

    discoveryProducts,

    explorationProducts,

  }
}