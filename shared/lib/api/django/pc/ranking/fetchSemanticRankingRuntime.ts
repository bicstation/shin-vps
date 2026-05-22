// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/fetchSemanticRankingRuntime.ts
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

const RANKING_RUNTIME_ENDPOINT =
  '/general/pc-products/ranking'

export async function fetchSemanticRankingRuntime(
  slug = 'score',
): Promise<SemanticRankingRuntime | null> {

  // ==========================================================================
  // Empty Guard
  // ==========================================================================

  if (!slug) {

    console.warn(
      '⚠️ SEMANTIC RANKING RUNTIME EMPTY SLUG'
    )

    return null
  }

  // ==========================================================================
  // Endpoint
  // ==========================================================================

  const endpoint = buildEndpoint(
    `${RANKING_RUNTIME_ENDPOINT}/${slug}/`
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
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 SEMANTIC RANKING RUNTIME FETCH'
  )

  console.log({
    slug,
    endpoint,
    pipeline:
      'legacy-semantic-ranking-runtime',
  })

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 RANKING RUNTIME RESPONSE',
    response
  )

  // ==========================================================================
  // Raw Payload Visibility
  // ==========================================================================

  console.log(
    '🔥 RANKING RESPONSE JSON',
    JSON.stringify(response, null, 2)
  )

  console.log(
    '🔥 RESPONSE KEYS',
    Object.keys(response || {})
  )

  console.log(
    '🔥 TOPOLOGY CHECK',
    {
      rankingResults:
        response?.ranking?.results?.length,

      results:
        (response as any)?.results?.length,

      products:
        (response as any)?.products?.length,

      rankingProducts:
        (response as any)
          ?.ranking_products?.length,

      items:
        (response as any)?.items?.length,

      groupedRankings:
        (response as any)
          ?.grouped_rankings
          ? Object.keys(
              (response as any)
                .grouped_rankings
            )
          : null,
    }
  )

  // ==========================================================================
  // Invalid Response
  // ==========================================================================

  if (!response) {

    console.error(
      '🔥 SEMANTIC RANKING RUNTIME FAILURE',
      {
        slug,
        endpoint,
      }
    )

    return {
      success: false,

      ranking: {
        results: [],
      },

      raw: null,
    }
  }

  // ==========================================================================
  // Normalize
  // ==========================================================================

  const normalized =
    normalizeRanking(response)

  // ==========================================================================
  // Normalize Visibility
  // ==========================================================================

  console.log(
    '🔥 NORMALIZED RANKING',
    normalized
  )

  console.log(
    '🔥 NORMALIZED RESULTS LENGTH',
    normalized?.ranking?.results?.length
  )

  return normalized
}

export default fetchSemanticRankingRuntime