// /app/concierge/runtime/recommendation/scoring/scoringRuntime.ts

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

export type ScoringRuntimeResult = {

  scoredRecommendations:
    RecommendationPayload[]

  metrics: {

    totalRecommendations:
      number

    maxScore:
      number
  }
}

/* =========================================
🔥 Execute Scoring Runtime
========================================= */

export function
executeScoringRuntime({
  recommendations = [],
  semanticIntent,
}: {
  recommendations?: RecommendationPayload[]
  semanticIntent?: SemanticIntent
}): ScoringRuntimeResult {

  const scoredRecommendations =

    RecommendationDomain
      .scoreRecommendations({

        recommendations,

        semanticIntent,

      })

  const maxScore =
    scoredRecommendations
      .reduce(
        (acc, r) =>
          Math.max(
            acc,
            r.score || 0
          ),
        0
      )

  const metrics = {

    totalRecommendations:
      scoredRecommendations.length,

    maxScore,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Scoring Runtime'
  )

  console.log(metrics)

  return {

    scoredRecommendations,

    metrics,
  }
}