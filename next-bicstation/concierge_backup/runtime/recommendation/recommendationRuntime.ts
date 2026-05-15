// /app/concierge/runtime/recommendation/recommendationRuntime.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '../../contracts/recommendation/RecommendationPayload'

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 CORE
========================================= */

import {
  executeRecommendationRuntime,
} from './core/recommendationRuntime'

/* =========================================
🔥 RANKING
========================================= */

import {
  executeRankingRuntime,
} from './ranking/rankingRuntime'

/* =========================================
🔥 SCORING
========================================= */

import {
  executeScoringRuntime,
} from './scoring/scoringRuntime'

/* =========================================
🔥 TYPES
========================================= */

export type RecommendationRuntimeResult = {

  recommendations:
    RecommendationPayload[]

  topRecommendation?:
    RecommendationPayload

  rankings:
    RecommendationPayload[]

  scoredRecommendations:
    RecommendationPayload[]

  metrics: {

    totalRecommendations:
      number

    topScore:
      number

    highestScore:
      number
  }
}

/* =========================================
🔥 Execute Recommendation Runtime
========================================= */

export function
executeRecommendationRuntimeFlow({
  recommendations = [],
  semanticIntent,
}: {
  recommendations?:
    RecommendationPayload[]

  semanticIntent?:
    SemanticIntent
}): RecommendationRuntimeResult {

  // ======================================
  // Core Runtime
  // ======================================

  const runtime =

    executeRecommendationRuntime({

      recommendations,

      semanticIntent,

    })

  // ======================================
  // Ranking Runtime
  // ======================================

  const ranking =

    executeRankingRuntime({

      recommendations:
        runtime.recommendations,

      semanticIntent,

    })

  // ======================================
  // Scoring Runtime
  // ======================================

  const scoring =

    executeScoringRuntime({

      recommendations:
        ranking.rankings,

      semanticIntent,

    })

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    totalRecommendations:

      runtime.recommendations
        ?.length || 0,

    topScore:

      runtime.topRecommendation
        ?.score || 0,

    highestScore:

      ranking.topRanking
        ?.score || 0,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Recommendation Runtime Flow'
  )

  console.log({

    totalRecommendations:

      metrics.totalRecommendations,

    topRecommendation:

      runtime.topRecommendation
        ?.name || null,

    highestScore:

      metrics.highestScore,

  })

  // ======================================
  // Result
  // ======================================

  return {

    recommendations:
      runtime.recommendations,

    topRecommendation:
      runtime.topRecommendation,

    rankings:
      ranking.rankings,

    scoredRecommendations:
      scoring.scoredRecommendations,

    metrics,
  }
}