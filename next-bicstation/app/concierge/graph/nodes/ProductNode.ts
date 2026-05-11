// /app/concierge/graph/nodes/ProductNode.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 Product Node Type
========================================= */

export type ProductNode = {

  id: string

  type:
    'product'

  label: string

  product:
    RecommendationPayload

  score?: number

  metadata?: Record<
    string,
    any
  >

  created_at: string
}

/* =========================================
🔥 Factory
========================================= */

export const createProductNode = ({
  product,
  score,
  metadata,
}: {
  product:
    RecommendationPayload

  score?: number

  metadata?: Record<
    string,
    any
  >
}): ProductNode => {

  return {

    id:

      product?.unique_id
      || crypto.randomUUID(),

    type:
      'product',

    label:

      product?.shortTitle
      || product?.name
      || 'unknown_product',

    product,

    score:

      score
      || product?.score
      || 0,

    metadata:
      metadata || {},

    created_at:
      new Date()
        .toISOString(),

  }
}

/* =========================================
🔥 Helpers
========================================= */

export const normalizeProductNode = (
  node?: Partial<ProductNode>
): ProductNode => {

  return {

    id:
      node?.id
      || crypto.randomUUID(),

    type:
      'product',

    label:
      node?.label
      || 'unknown_product',

    product:
      node?.product
      || {},

    score:
      node?.score
      || 0,

    metadata:
      node?.metadata
      || {},

    created_at:
      node?.created_at
      || new Date()
        .toISOString(),

  }
}

export const isHighScoreProductNode = (
  node?: ProductNode
) => {

  return (
    (node?.score || 0)
    >= 90
  )
}

export const resolveProductPrice = (
  node?: ProductNode
) => {

  return (
    node?.product?.price
    || 0
  )
}

export default ProductNode