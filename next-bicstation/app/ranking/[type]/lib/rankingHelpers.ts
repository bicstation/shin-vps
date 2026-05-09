// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/lib/rankingHelpers.ts

/* =========================================
🔥 Types
========================================= */

import type {
  RankingProduct,
  SemanticAttribute,
} from '../types/ranking'

/* =========================================
🔥 Product Helpers
========================================= */

export function
getTopProduct(
  products:
    RankingProduct[]
): RankingProduct | null {

  if (!products?.length) {
    return null
  }

  return products[0]
}

export function
getOtherProducts(
  products:
    RankingProduct[]
): RankingProduct[] {

  if (!products?.length) {
    return []
  }

  return products.slice(1)
}

/* =========================================
🔥 Product Validation
========================================= */

export function
hasValidProducts(
  products:
    RankingProduct[]
): boolean {

  return !!products?.length
}

/* =========================================
🔥 Product Limiter
========================================= */

export function
limitProducts(
  products:
    RankingProduct[],

  limit = 12
): RankingProduct[] {

  if (!products?.length) {
    return []
  }

  return products.slice(
    0,
    limit
  )
}

/* =========================================
🔥 Attribute Finder
========================================= */

export function
findAttributeBySlug(

  attributes:
    SemanticAttribute[],

  slug: string
): SemanticAttribute | null {

  if (
    !attributes?.length
  ) {
    return null
  }

  return (

    attributes.find(
      (
        attribute
      ) => (

        attribute?.slug
        === slug
      )
    )

    || null
  )
}

/* =========================================
🔥 Grouped Attribute Resolver
========================================= */

export function
resolveGroupedAttributes(
  product:
    RankingProduct,

  group: string
): SemanticAttribute[] {

  return (

    product
      ?.grouped_attributes
      ?.[group]

    || []
  )
}

/* =========================================
🔥 Semantic Density
========================================= */

export function
calculateSemanticDensity(
  product:
    RankingProduct
): number {

  const grouped =
    product
      ?.grouped_attributes
      || {}

  return Object.values(
    grouped
  ).reduce(

    (
      total,
      attrs
    ) => (

      total
      + (
        attrs?.length
        || 0
      )
    ),

    0
  )
}

/* =========================================
🔥 Product Score Sort
========================================= */

export function
sortProductsByScore(
  products:
    RankingProduct[]
): RankingProduct[] {

  if (!products?.length) {
    return []
  }

  return [...products]
    .sort(

      (
        a,
        b
      ) => (

        (
          b?.score
          || 0
        )

        -

        (
          a?.score
          || 0
        )
      )
    )
}

/* =========================================
🔥 Semantic Weight Sort
========================================= */

export function
sortProductsBySemanticWeight(
  products:
    RankingProduct[]
): RankingProduct[] {

  if (!products?.length) {
    return []
  }

  return [...products]
    .sort(

      (
        a,
        b
      ) => (

        (
          b?.semantic_score
          || 0
        )

        -

        (
          a?.semantic_score
          || 0
        )
      )
    )
}

