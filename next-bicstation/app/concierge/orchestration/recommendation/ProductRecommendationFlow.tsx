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

import RecommendationCard
  from '@/app/concierge/components/RecommendationCard'

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