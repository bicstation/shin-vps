// /app/concierge/pipelines/recommendation/recommendationPipeline.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

import type {
  RecommendationState,
} from '@/app/concierge/contracts/recommendation/RecommendationState'

/* =========================================
🔥 DOMAIN
========================================= */

import RecommendationDomain
  from '@/app/concierge/domain/recommendation/recommendationDomain'

/* =========================================
🔥 PIPELINE RESULT
========================================= */

export type RecommendationPipelineResult = {

  state:
    RecommendationState

  recommendations:
    RecommendationPayload[]

  topRecommendation?:
    RecommendationPayload

  metrics: {

    totalRecommendations:
      number

    topScore:
      number

    usage?: string
  }
}

/* =========================================
🔥 Create Pipeline State
========================================= */

export function
createRecommendationPipelineState():
RecommendationState {

  return RecommendationDomain
    .createInitialState()
}

/* =========================================
🔥 Execute Recommendation Pipeline
========================================= */

export function
executeRecommendationPipeline({
  state,
  recommendations,
  semanticIntent,
}: {
  state:
    RecommendationState

  recommendations:
    RecommendationPayload[]

  semanticIntent?:
    SemanticIntent
}): RecommendationPipelineResult {

  // ======================================
  // Runtime Recommendations
  // ======================================

  const runtimeRecommendations =

    RecommendationDomain
      .buildRecommendationRuntime({

        recommendations,

        semanticIntent,

      })

  // ======================================
  // Top Recommendation
  // ======================================

  const topRecommendation =

    RecommendationDomain
      .getTopRecommendation(
        runtimeRecommendations
      )

  // ======================================
  // Updated State
  // ======================================

  const nextState = {

    ...state,

    recommendations:
      runtimeRecommendations,

  }

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    totalRecommendations:

      runtimeRecommendations
        ?.length || 0,

    topScore:

      topRecommendation
        ?.score || 0,

    usage:
      semanticIntent
        ?.usage,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Recommendation Pipeline'
  )

  console.log({

    topRecommendation:

      topRecommendation
        ?.name || null,

    metrics,

  })

  // ======================================
  // Result
  // ======================================

  return {

    state:
      nextState,

    recommendations:
      runtimeRecommendations,

    topRecommendation,

    metrics,

  }
}