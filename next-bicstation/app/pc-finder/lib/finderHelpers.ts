// /lib/finderHelpers.ts

/* =========================================
🔥 Types
========================================= */

import type {

  FinderProduct,

  SemanticAttribute,

} from '../types/finder'

/* =========================================
🔥 Safe Array
========================================= */

export function
safeArray<T>(
  value: T[]
    | undefined
    | null
) {

  return Array.isArray(
    value
  )

    ? value

    : []
}

/* =========================================
🔥 Safe Number
========================================= */

export function
safeNumber(
  value: any,
  fallback = 0
) {

  return typeof value
    === 'number'

    ? value

    : fallback
}

/* =========================================
🔥 Safe String
========================================= */

export function
safeString(
  value: any,
  fallback = ''
) {

  return typeof value
    === 'string'

    ? value

    : fallback
}

/* =========================================
🔥 Product Image
========================================= */

export function
resolveProductImage(
  product?: FinderProduct
) {

  return (

    product?.image_url

    ||

    '/images/no-image.webp'

  )
}

/* =========================================
🔥 Product Price
========================================= */

export function
resolveProductPrice(
  product?: FinderProduct
) {

  if (
    typeof product?.price
    !== 'number'
  ) {

    return '価格未設定'
  }

  return `¥${product.price.toLocaleString()}`
}

/* =========================================
🔥 Semantic Tags
========================================= */

export function
extractSemanticAttributes(
  product?: FinderProduct
) {

  if (
    !product
      ?.grouped_attributes
  ) {

    return []
  }

  return Object.values(

    product
      .grouped_attributes

  )

    .flat()

    .filter(Boolean)
}

/* =========================================
🔥 Semantic Tags Limited
========================================= */

export function
extractLimitedSemanticTags(
  product?: FinderProduct,
  limit = 6
) {

  return extractSemanticAttributes(
    product
  )

    .slice(0, limit)
}

/* =========================================
🔥 Semantic Label
========================================= */

export function
resolveSemanticLabel(
  attribute?: SemanticAttribute
) {

  return (

    attribute?.name

    ||

    attribute?.slug

    ||

    'semantic'

  )
}

/* =========================================
🔥 Product Specs
========================================= */

export function
buildProductSpecs(
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
        'CPU',

      value:
        safeString(
          product.cpu_model,
          '-'
        ),
    },

    {
      label:
        'GPU',

      value:
        safeString(
          product.gpu_model,
          '-'
        ),
    },

    {
      label:
        'Memory',

      value:

        product?.memory_gb

        ? `${product.memory_gb}GB`

        : '-',
    },

    {
      label:
        'Storage',

      value:

        product?.storage_gb

        ? `${product.storage_gb}GB`

        : '-',
    },

  ]
}

/* =========================================
🔥 Recommendation Badge
========================================= */

export function
resolveRecommendationBadge(
  score?: number
) {

  if (
    typeof score
    !== 'number'
  ) {

    return 'UNKNOWN'
  }

  if (
    score >= 90
  ) {

    return 'BEST MATCH'
  }

  if (
    score >= 75
  ) {

    return 'HIGH MATCH'
  }

  if (
    score >= 60
  ) {

    return 'GOOD MATCH'
  }

  return 'MATCH'
}

/* =========================================
🔥 Semantic Count
========================================= */

export function
countSemanticAttributes(
  product?: FinderProduct
) {

  return extractSemanticAttributes(
    product
  ).length
}

/* =========================================
🔥 Semantic Groups
========================================= */

export function
countSemanticGroups(
  product?: FinderProduct
) {

  return Object.keys(

    product
      ?.grouped_attributes
      || {}

  ).length
}

/* =========================================
🔥 Product Summary
========================================= */

export function
buildProductShortSummary(
  product?: FinderProduct
) {

  if (
    !product
  ) {

    return `
No semantic summary.
`
  }

  return `
${safeString(product.maker)}
 /
${safeString(product.cpu_model)}
 /
${safeString(product.gpu_model)}
`
}

/* =========================================
🔥 Product Validation
========================================= */

export function
isValidFinderProduct(
  product?: FinderProduct
) {

  return !!(

    product?.unique_id
    &&
    product?.name

  )
}

/* =========================================
🔥 Normalize Finder Products
========================================= */

export function
normalizeFinderProducts(
  products: FinderProduct[]
) {

  return safeArray(
    products
  ).filter(
    isValidFinderProduct
  )
}

/* =========================================
🔥 Debug
========================================= */

export function
debugFinderHelpers(
  payload: any
) {

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 FINDER HELPERS DEBUG'
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