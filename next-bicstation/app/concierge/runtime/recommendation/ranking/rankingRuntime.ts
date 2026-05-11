// /app/concierge/runtime/recommendation/ranking/rankingRuntime.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import RecommendationDomain
  from '@/app/concierge/domain/recommendation/recommendationDomain'

/* =========================================
🔥 TYPES
========================================= */

export type RankingRuntimeResult = {

  rankings:
    RecommendationPayload[]

  topRanking?:
    RecommendationPayload

  metrics: {

    totalRankings:
      number

    highestScore:
      number

    usage?: string
  }
}

/* =========================================
🔥 Execute Ranking Runtime
========================================= */

export function
executeRankingRuntime({
  recommendations = [],
  semanticIntent,
  limit = 10,
}: {
  recommendations?: RecommendationPayload[]
  semanticIntent?: SemanticIntent
  limit?: number
}): RankingRuntimeResult {

  // ======================================
  // Runtime Recommendations
  // ======================================

  const rankings =

    RecommendationDomain
      .buildRecommendationRuntime({

        recommendations,

        semanticIntent,

      })
      .slice(
        0,
        limit
      )

  // ======================================
  // Top Ranking
  // ======================================

  const topRanking =
    rankings?.[0]

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    totalRankings:
      rankings.length,

    highestScore:
      topRanking?.score || 0,

    usage:
      semanticIntent
        ?.usage,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Ranking Runtime'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    topRanking:
      topRanking?.name || null,

    metrics,

  })

  // ======================================
  // Result
  // ======================================

  return {

    rankings,

    topRanking,

    metrics,
  }
}