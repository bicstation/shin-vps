// /home/maya/shin-vps/next-bicstation/app/concierge/runtime/recommendation/core/recommendationRuntime.ts

// /app/concierge/runtime/recommendation/core/recommendationRuntime.ts

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

export type RecommendationRuntimeResult = {

  recommendations:
    RecommendationPayload[]

  topRecommendation?:
    RecommendationPayload

  metrics: {

    totalRecommendations:
      number

    topScore:
      number
  }
}

/* =========================================
🔥 Execute Recommendation Runtime
========================================= */

export function
executeRecommendationRuntime({
  recommendations = [],
  semanticIntent,
}: {
  recommendations?: RecommendationPayload[]
  semanticIntent?: SemanticIntent
}): RecommendationRuntimeResult {

  const runtimeRecommendations =

    RecommendationDomain.buildRecommendationRuntime({

      recommendations,

      semanticIntent,

    })

  const topRecommendation =

    RecommendationDomain.getTopRecommendation(
      runtimeRecommendations
    )

  const metrics = {

    totalRecommendations:
      runtimeRecommendations.length,

    topScore:
      topRecommendation?.score || 0,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Recommendation Runtime'
  )

  console.log({

    topRecommendation:
      topRecommendation?.name || null,

    metrics,

  })

  // ======================================
  // Result
  // ======================================

  return {

    recommendations:
      runtimeRecommendations,

    topRecommendation,

    metrics,
  }
}