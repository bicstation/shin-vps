// /app/concierge/runtime/semantic/reasoning/reasoningRuntime.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../../contracts/semantic/SemanticIntent'

import type {
  RecommendationPayload,
} from '../../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticDomain
  from '../../../domain/semantic/semanticDomain'

/* =========================================
🔥 GRAPH
========================================= */

import SemanticGraph
  from '../../../graph/SemanticGraph'

/* =========================================
🔥 TYPES
========================================= */

export type ReasoningRuntimeResult = {

  summary:
    string

  reasoning:
    string

  graph:
    ReturnType<
      typeof SemanticGraph.build
    >

  metrics: {

    graphNodes:
      number

    graphEdges:
      number

    recommendations:
      number
  }
}

/* =========================================
🔥 Execute Reasoning Runtime
========================================= */

export function
executeReasoningRuntime({
  semanticIntent,
  recommendations = [],
}: {
  semanticIntent?:
    SemanticIntent

  recommendations?:
    RecommendationPayload[]
}): ReasoningRuntimeResult {

  // ======================================
  // Semantic Summary
  // ======================================

  const summary =

    SemanticDomain
      .buildSemanticSummary(
        semanticIntent
      )

  // ======================================
  // Reasoning
  // ======================================

  const reasoning =

    SemanticDomain
      .buildSemanticReasoning({

        semanticIntent,

        recommendations,

      })

  // ======================================
  // Semantic Graph
  // ======================================

  const graph =

    SemanticGraph.build({

      semanticIntent,

      recommendations,

    })

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    graphNodes:
      graph?.nodes
        ?.length || 0,

    graphEdges:
      graph?.edges
        ?.length || 0,

    recommendations:
      recommendations
        ?.length || 0,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Reasoning Runtime'
  )

  console.log({

    summary,

    metrics,

  })

  // ======================================
  // Result
  // ======================================

  return {

    summary,

    reasoning,

    graph,

    metrics,
  }
}