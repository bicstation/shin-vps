// /app/concierge/orchestration/recommendation/RecommendationRuntimeFlow.tsx

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
🔥 GRAPH
========================================= */

import SemanticGraph
  from '@/app/concierge/graph/SemanticGraph'

/* =========================================
🔥 FLOWS
========================================= */

import ConciergeRecommendationFlow
  from './ConciergeRecommendationFlow'

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
🔥 Recommendation Runtime Flow
========================================= */

export default function
RecommendationRuntimeFlow({
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
  // Semantic Graph
  // ======================================

  const graph =

    useMemo(() => (

      SemanticGraph.build({

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

  const metrics =

    useMemo(() => ({

      totalRecommendations:

        runtimeRecommendations
          ?.length || 0,

      graphNodes:

        graph?.nodes
          ?.length || 0,

      graphEdges:

        graph?.edges
          ?.length || 0,

      usage:
        semanticIntent
          ?.usage || null,

    }), [

      runtimeRecommendations,
      graph,
      semanticIntent,

    ])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Recommendation Runtime Flow'
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

    return null
  }

  // ======================================
  // Render
  // ======================================

  return (

    <ConciergeRecommendationFlow

      recommendations={
        runtimeRecommendations
      }

      semanticIntent={
        semanticIntent
      }

    />

  )
}