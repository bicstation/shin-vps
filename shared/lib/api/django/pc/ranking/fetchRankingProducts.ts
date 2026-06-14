// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/fetchRankingProducts.ts
// ============================================================================

import type {
  SemanticRankingRuntime,
} from './contracts'

import {
  buildEndpoint,
} from '../utils/buildEndpoint'

import {
  safeFetch,
} from '../utils/safeFetch'

import {
  normalizeRanking,
} from './normalize'

const RANKING_ENDPOINT =
  '/pc/ranking'

export async function fetchRankingProducts(
  type = 'score',
): Promise<any> {

  // ==========================================================================
  // Empty Guard
  // ==========================================================================

  if (!type) {

    console.warn(
      '⚠️ FETCH RANKING PRODUCTS EMPTY TYPE'
    )

    return null
  }

  // ==========================================================================
  // Endpoint
  // ==========================================================================

  const endpoint = buildEndpoint(
    `${RANKING_ENDPOINT}/${type}/`
  )

  // ==========================================================================
  // Fetch
  // ==========================================================================

  const response =
    await safeFetch<SemanticRankingRuntime>(
      endpoint
    )

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(
    '🔥 FETCH RANKING PRODUCTS URL',
    endpoint
  )

  console.log(
    '🔥 FETCH RANKING PRODUCTS RAW',
    response
  )

  // ==========================================================================
  // Invalid Response
  // ==========================================================================

  if (!response) {

    console.error(
      '🔥 FETCH RANKING PRODUCTS FAILURE',
      {
        type,
        endpoint,
      }
    )

    return {
      products: [],
    }
  }

  // ==========================================================================
  // Normalize
  // ==========================================================================

  const normalized =
    normalizeRanking(response)

  // ==========================================================================
  // Runtime Payload
  // ==========================================================================

  const runtimePayload =
    normalized as any

  // ==========================================================================
  // Canonical Product Continuity
  // ==========================================================================

  const products =

    Array.isArray(
      runtimePayload?.products
    )

      ? runtimePayload.products

    : Array.isArray(
        runtimePayload?.results
      )

      ? runtimePayload.results

    : Array.isArray(
        runtimePayload?.ranking?.results
      )

      ? runtimePayload.ranking.results

    : Array.isArray(
        runtimePayload?.items
      )

      ? runtimePayload.items

    : Array.isArray(
        runtimePayload?.ranking_products
      )

      ? runtimePayload.ranking_products

    : []

  // ==========================================================================
  // Continuity Debug
  // ==========================================================================

  console.log(
    '🔥 CANONICAL RANKING PRODUCTS',
    {
      length: products.length,
    }
  )

  // ==========================================================================
  // Canonical Frontend Contract
  // ==========================================================================

  return {
    products,
  }
}

export default fetchRankingProducts