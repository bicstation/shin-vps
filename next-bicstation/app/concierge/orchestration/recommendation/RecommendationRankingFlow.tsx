// /app/concierge/orchestration/recommendation/RecommendationRankingFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

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
🔥 DOMAIN
========================================= */

import RecommendationDomain
  from '../../domain/recommendation/recommendationDomain'

/* =========================================
🔥 COMPONENTS
========================================= */

import RecommendationList
  from '../../sections/recommendation/RecommendationList'

import ConciergeEmpty
  from '../../sections/system/ConciergeEmpty'

/* =========================================
🔥 Props
========================================= */

type Props = {

  recommendations?:
    RecommendationPayload[]

  semanticIntent?:
    SemanticIntent

  limit?: number
}

/* =========================================
🔥 Recommendation Ranking Flow
========================================= */

export default function
RecommendationRankingFlow({
  recommendations = [],
  semanticIntent,
  limit = 10,
}: Props) {

  // ======================================
  // Runtime Recommendations
  // ======================================

  const runtimeRecommendations =

    useMemo(() => {

      const runtime =

        RecommendationDomain
          .buildRecommendationRuntime({

            recommendations,

            semanticIntent,

          })

      return runtime.slice(
        0,
        limit
      )

    }, [

      recommendations,
      semanticIntent,
      limit,

    ])

  // ======================================
  // Empty
  // ======================================

  if (
    !runtimeRecommendations
      ?.length
  ) {

    return (
      <ConciergeEmpty />
    )
  }

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    total:
      runtimeRecommendations
        ?.length || 0,

    topScore:

      runtimeRecommendations?.[0]
        ?.score || 0,

    usage:
      semanticIntent
        ?.usage || null,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Recommendation Ranking Flow'
  )

  console.log(
    metrics
  )

  // ======================================
  // Render
  // ======================================

  return (

    <RecommendationList

      recommendations={
        runtimeRecommendations
      }

      semanticIntent={
        semanticIntent
      }

    />

  )
}