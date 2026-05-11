// /app/concierge/orchestration/recommendation/ProductRecommendationFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '../contracts/recommendation/RecommendationPayload'

import type {
  SemanticIntent,
} from '../contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import RecommendationDomain
  from '../domain/recommendation/recommendationDomain'

/* =========================================
🔥 COMPONENTS
========================================= */

import RecommendationCard
  from '../components/RecommendationCard'

import ConciergeEmpty
  from '../sections/system/ConciergeEmpty'

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
🔥 Product Recommendation Flow
========================================= */

export default function
ProductRecommendationFlow({
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
    !topRecommendation
  ) {

    return (
      <ConciergeEmpty />
    )
  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Product Recommendation Flow'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    recommendation:

      topRecommendation?.name,

    score:

      topRecommendation?.score,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <RecommendationCard

      recommendation={
        topRecommendation
      }

      semanticIntent={
        semanticIntent
      }

    />

  )
}