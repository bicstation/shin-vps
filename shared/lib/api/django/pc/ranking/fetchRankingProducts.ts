// /shared/lib/api/django/pc/ranking/fetchRankingProducts.ts

/* =========================================
🔥 Utils
========================================= */

import {
  buildEndpoint,
} from '../utils/buildEndpoint'

import {
  safeFetch,
} from '../utils/safeFetch'

/* =========================================
🔥 Fetch Ranking Products
========================================= */

export async function
fetchRankingProducts(

  type = 'score'

) {

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =

    buildEndpoint(

      `/general/pc-products/ranking/${type}/`

    )

  // ======================================
  // Fetch
  // ======================================

  const json =

    await safeFetch(
      endpoint
    )

  // ======================================
  // Normalize
  // ======================================

  return {

    success:
      json?.success
      || false,

    products:

      Array.isArray(
        json?.products
      )

        ? json.products

        : [],
  }
}