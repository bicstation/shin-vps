// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/related.ts

/* =========================================
🔥 Contracts
========================================= */

import type {

  RelatedQuery,

  RelatedResponse,

} from './contracts/related.contract'

/* =========================================
🔥 Utils
========================================= */

import {
  buildEndpoint,
} from './utils/buildEndpoint'

import {
  safeFetch,
} from './utils/safeFetch'

/* =========================================
🔥 Normalize
========================================= */

import {
  normalizeRelated,
} from './normalization/normalizeRelated'

/* =========================================
🔥 Endpoint
========================================= */

const RELATED_ENDPOINT =
  '/general/pc-products'

/* =========================================
🔥 Fetch Related Products
========================================= */

export async function
fetchRelatedProducts(

  query: RelatedQuery
): Promise<
  RelatedResponse
> {

  // ======================================
  // Guard
  // ======================================

  if (!query?.unique_id) {

    return {
      success: false,
      count: 0,
      products: [],
    }
  }

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =
    buildEndpoint(

      `${RELATED_ENDPOINT}/${query.unique_id}/related/`,

      {
        limit:
          query.limit,
      }
    )

  // ======================================
  // Fetch
  // ======================================

  const response =
    await safeFetch(
      endpoint
    )

  // ======================================
  // Normalize
  // ======================================

  return normalizeRelated(
    response
  )
}

