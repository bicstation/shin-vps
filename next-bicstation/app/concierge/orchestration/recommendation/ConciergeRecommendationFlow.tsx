// /app/concierge/orchestration/recommendation/ConciergeRecommendationFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

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
🔥 COMPONENTS
========================================= */

import RecommendationList
  from '@/app/concierge/components/RecommendationList'

import ConciergeEmpty
  from '@/app/concierge/components/ConciergeEmpty'

/* =========================================
🔥 Props
========================================= */

type Props = {

  recommendations?:
    RecommendationPayload[]

  semanticIntent?:
    SemanticIntent
}

/* =========================================
🔥 Concierge Recommendation Flow
========================================= */

export default function
ConciergeRecommendationFlow({
  recommendations = [],
  semanticIntent,
}: Props) {

  // ======================================
  // Runtime Recommendations
  // ======================================

  const runtimeRecommendations =

    useMemo(() => (

      RecommendationDomain
        .buildRecommendationRuntime({

          recommendations,

          semanticIntent,

        })

    ), [

      recommendations,
      semanticIntent,

    ])

  // ======================================
  // Top Recommendation
  // ======================================

  const topRecommendation =

    useMemo(() => (

      RecommendationDomain
        .getTopRecommendation(
          runtimeRecommendations
        )

    ), [runtimeRecommendations])

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
  // Debug
  // ======================================

  console.log(
    '🔥 Concierge Recommendation Flow'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    total:

      runtimeRecommendations
        ?.length || 0,

    topRecommendation:

      topRecommendation?.name
      || null,

  })

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