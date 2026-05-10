// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/ranking.ts

/* =========================================
🔥 Contracts
========================================= */

import type {

  RankingQuery,

  RankingResponse,

} from './contracts/ranking.contract'

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
  normalizeRanking,
} from './normalization/normalizeRanking'

/* =========================================
🔥 Endpoint
========================================= */

const RANKING_ENDPOINT =
  '/general/pc-products/ranking/'

/* =========================================
🔥 Fetch Ranking
========================================= */

export async function
fetchRanking(

  query?: RankingQuery
): Promise<
  RankingResponse
> {

  // ======================================
  // Endpoint
  // ======================================

  const endpoint =
    buildEndpoint(

      RANKING_ENDPOINT,

      query
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

  return normalizeRanking(
    response
  )
}

/* =========================================
🔥 Fetch Ranking By Type
========================================= */

export async function
fetchRankingByType(

  type: string
): Promise<
  RankingResponse
> {

  return fetchRanking({
    type,
  })
}

