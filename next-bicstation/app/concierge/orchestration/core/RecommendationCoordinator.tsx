// /app/concierge/orchestration/core/RecommendationCoordinator.tsx

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
🔥 GRAPH
========================================= */

import SemanticGraph
  from '../../graph/SemanticGraph'

/* =========================================
🔥 FLOWS
========================================= */

import RecommendationConversionFlow
  from '../../orchestration/conversion/RecommendationConversionFlow'

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
🔥 Recommendation Coordinator
========================================= */

export default function
RecommendationCoordinator({
  recommendations = [],
  semanticIntent,
}: Props) {

  // ======================================
  // Runtime Recommendations
  // ======================================

  const runtimeRecommendations =

    useMemo(() => {

      return RecommendationDomain
        .buildRecommendationRuntime({

          recommendations,

          semanticIntent,

        })

    }, [

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
  // Top Recommendation
  // ======================================

  const topRecommendation =

    useMemo(() => (

      runtimeRecommendations?.[0]

    ), [runtimeRecommendations])

  // ======================================
  // Metrics
  // ======================================

  const metrics =

    useMemo(() => {

      return {

        totalRecommendations:

          runtimeRecommendations
            ?.length || 0,

        topScore:

          topRecommendation
            ?.score || 0,

        graphNodes:

          graph?.nodes
            ?.length || 0,

        graphEdges:

          graph?.edges
            ?.length || 0,

      }

    }, [

      runtimeRecommendations,
      topRecommendation,
      graph,

    ])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Recommendation Coordinator'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    topRecommendation:

      topRecommendation?.name
      || null,

    metrics,

  })

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

    <RecommendationConversionFlow

      recommendations={
        runtimeRecommendations
      }

      semanticIntent={
        semanticIntent
      }

    />

  )
}