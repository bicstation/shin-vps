// /app/concierge/orchestration/recommendation/SemanticRecommendationFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

import type {
  RecommendationPayload,
} from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 DOMAIN
========================================= */

import RecommendationDomain
  from '../../domain/recommendation/recommendationDomain'

/* =========================================
🔥 GRAPH
========================================= */

import SemanticGraph
  from '../../graph/SemanticGraph'

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

  semanticIntent?:
    SemanticIntent

  recommendations?:
    RecommendationPayload[]
}

/* =========================================
🔥 Semantic Recommendation Flow
========================================= */

export default function
SemanticRecommendationFlow({
  semanticIntent,
  recommendations = [],
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
  // Connected Products
  // ======================================

  const connectedProducts =

    useMemo(() => (

      SemanticGraph
        .resolveConnectedProducts({

          semanticIntent,

          recommendations:
            runtimeRecommendations,

        })

    ), [

      semanticIntent,
      runtimeRecommendations,

    ])

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    usage:
      semanticIntent
        ?.usage || null,

    recommendations:

      runtimeRecommendations
        ?.length || 0,

    connectedProducts:

      connectedProducts
        ?.length || 0,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Recommendation Flow'
  )

  console.log(
    metrics
  )

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