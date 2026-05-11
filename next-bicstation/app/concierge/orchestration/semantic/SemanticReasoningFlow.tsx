// /app/concierge/orchestration/semantic/SemanticReasoningFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticDomain
  from '@/app/concierge/domain/semantic/semanticDomain'

import RecommendationDomain
  from '@/app/concierge/domain/recommendation/recommendationDomain'

/* =========================================
🔥 GRAPH
========================================= */

import SemanticGraph
  from '@/app/concierge/graph/SemanticGraph'

/* =========================================
🔥 FORMATTER
========================================= */

import {
  buildRecommendationReasoning,
} from '@/app/concierge/lib/core/conversion'

/* =========================================
🔥 COMPONENTS
========================================= */

import SemanticBadge
  from '@/app/concierge/components/SemanticBadge'

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
🔥 Semantic Reasoning Flow
========================================= */

export default function
SemanticReasoningFlow({
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
  // Semantic Summary
  // ======================================

  const summary =

    useMemo(() => (

      SemanticDomain
        .buildSemanticSummary(
          semanticIntent
        )

    ), [semanticIntent])

  // ======================================
  // Reasoning
  // ======================================

  const reasoning =

    useMemo(() => (

      buildRecommendationReasoning({

        semanticIntent,

      })

    ), [semanticIntent])

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

  const metrics = {

    usage:
      semanticIntent
        ?.usage || null,

    recommendations:

      runtimeRecommendations
        ?.length || 0,

    graphNodes:

      graph?.nodes
        ?.length || 0,

    graphEdges:

      graph?.edges
        ?.length || 0,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Reasoning Flow'
  )

  console.log({

    summary,

    reasoning,

    metrics,

  })

  // ======================================
  // Empty
  // ======================================

  if (
    !semanticIntent
  ) {

    return null
  }

  // ======================================
  // Render
  // ======================================

  return (

    <SemanticBadge

      semanticIntent={
        semanticIntent
      }

      summary={
        reasoning
      }

    />

  )
}