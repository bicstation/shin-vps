// /lib/finderConversion.ts

/* =========================================
🔥 Types
========================================= */

import type {
  FinderProduct,
} from '../types/finder'

/* =========================================
🔥 Price Format
========================================= */

export function
formatFinderPrice(
  value?: number
) {

  if (
    typeof value
    !== 'number'
  ) {

    return '価格未設定'
  }

  return `¥${value.toLocaleString()}`
}

/* =========================================
🔥 Spec Score Label
========================================= */

export function
resolveSpecScoreLabel(
  score?: number
) {

  if (
    typeof score
    !== 'number'
  ) {

    return 'Unknown'
  }

  if (
    score >= 95
  ) {

    return 'ULTRA'
  }

  if (
    score >= 85
  ) {

    return 'HIGH-END'
  }

  if (
    score >= 70
  ) {

    return 'BALANCED'
  }

  return 'ENTRY'
}

/* =========================================
🔥 Recommendation Rank
========================================= */

export function
resolveRecommendationRank(
  index: number
) {

  if (
    index === 0
  ) {

    return 'S'
  }

  if (
    index <= 2
  ) {

    return 'A'
  }

  if (
    index <= 5
  ) {

    return 'B'
  }

  return 'C'
}

/* =========================================
🔥 Confidence Label
========================================= */

export function
resolveConfidenceLabel(
  confidence?: number
) {

  if (
    typeof confidence
    !== 'number'
  ) {

    return 'UNKNOWN'
  }

  if (
    confidence >= 90
  ) {

    return 'VERY HIGH'
  }

  if (
    confidence >= 75
  ) {

    return 'HIGH'
  }

  if (
    confidence >= 60
  ) {

    return 'MEDIUM'
  }

  return 'LOW'
}

/* =========================================
🔥 Normalize Product
========================================= */

export function
normalizeFinderProduct(
  product: FinderProduct
) {

  return {

    ...product,

    display_price:

      formatFinderPrice(
        product?.price
      ),

    spec_label:

      resolveSpecScoreLabel(
        product?.spec_score
      ),

    confidence_label:

      resolveConfidenceLabel(
        product?.confidence
      ),

  }
}

/* =========================================
🔥 Normalize Products
========================================= */

export function
normalizeFinderProducts(
  products: FinderProduct[]
) {

  if (
    !Array.isArray(
      products
    )
  ) {

    return []
  }

  return products.map(
    normalizeFinderProduct
  )
}

/* =========================================
🔥 Featured Product
========================================= */

export function
convertFeaturedProduct(
  product?: FinderProduct
) {

  if (
    !product
  ) {

    return null
  }

  return {

    ...normalizeFinderProduct(
      product
    ),

    hero_title:

      product?.name
      || 'Recommended PC',

    hero_description:

      product
        ?.recommendation_summary

      ||

      'semantic recommendation',

  }
}

/* =========================================
🔥 Recommendation Metrics
========================================= */

export function
buildRecommendationMetrics(
  product?: FinderProduct
) {

  if (
    !product
  ) {

    return []
  }

  return [

    {
      label:
        'Spec Score',

      value:
        product?.spec_score
        || 0,
    },

    {
      label:
        'Semantic Score',

      value:
        product?.semantic_score
        || 0,
    },

    {
      label:
        'Confidence',

      value:
        product?.confidence
        || 0,
    },

    {
      label:
        'Recommendation',

      value:

        product
          ?.recommendation_score
        || 0,
    },

  ]
}

/* =========================================
🔥 Product Summary
========================================= */

export function
buildFinderProductSummary(
  product?: FinderProduct
) {

  if (
    !product
  ) {

    return `
No product summary.
`
  }

  return `
${product?.maker || 'Unknown'}
/
${product?.cpu_model || 'CPU'}
/
${product?.gpu_model || 'GPU'}
/
${product?.memory_gb || 0}GB RAM
/
${product?.storage_gb || 0}GB Storage
`
}

/* =========================================
🔥 Debug
========================================= */

export function
debugFinderConversion(
  payload: any
) {

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 FINDER CONVERSION DEBUG'
  )

  console.log(
    JSON.stringify(
      payload,
      null,
      2
    )
  )

  console.log(
    '🔥 =====================================\n'
  )
}