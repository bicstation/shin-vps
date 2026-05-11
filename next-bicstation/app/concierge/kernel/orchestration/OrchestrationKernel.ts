// /app/concierge/kernel/orchestration/OrchestrationKernel.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticDomain
  from '@/app/concierge/domain/semantic/semanticDomain'

import RecommendationDomain
  from '@/app/concierge/domain/recommendation/recommendationDomain'

import RoutingDomain
  from '@/app/concierge/domain/routing/routingDomain'

/* =========================================
🔥 GRAPH
========================================= */

import SemanticGraph
  from '@/app/concierge/graph/SemanticGraph'

/* =========================================
🔥 KERNEL
========================================= */

export const OrchestrationKernel = {

  /* =====================================
  Resolve Semantic Intent
  ===================================== */

  resolveSemanticIntent(
    messages:
      ConversationMessage[] = []
  ): SemanticIntent {

    return SemanticDomain
      .resolveSemanticIntent(
        messages
      )
  },

  /* =====================================
  Build Recommendations
  ===================================== */

  buildRecommendations({
    recommendations,
    semanticIntent,
  }: {
    recommendations:
      RecommendationPayload[]

    semanticIntent?:
      SemanticIntent
  }) {

    return RecommendationDomain
      .buildRecommendationRuntime({

        recommendations,

        semanticIntent,

      })
  },

  /* =====================================
  Resolve Route
  ===================================== */

  resolveRoute(
    semanticIntent?:
      SemanticIntent
  ) {

    return RoutingDomain
      .resolveSemanticRoute(
        semanticIntent
      )
  },

  /* =====================================
  Build Semantic Graph
  ===================================== */

  buildGraph({
    semanticIntent,
    recommendations,
  }: {
    semanticIntent?:
      SemanticIntent

    recommendations:
      RecommendationPayload[]
  }) {

    return SemanticGraph
      .build({

        semanticIntent,

        recommendations,

      })
  },

  /* =====================================
  Execute Runtime
  ===================================== */

  execute({
    messages,
    recommendations,
  }: {
    messages:
      ConversationMessage[]

    recommendations:
      RecommendationPayload[]
  }) {

    // ===================================
    // Semantic Intent
    // ===================================

    const semanticIntent =

      this.resolveSemanticIntent(
        messages
      )

    // ===================================
    // Recommendation Runtime
    // ===================================

    const runtimeRecommendations =

      this.buildRecommendations({

        recommendations,

        semanticIntent,

      })

    // ===================================
    // Routing
    // ===================================

    const route =

      this.resolveRoute(
        semanticIntent
      )

    // ===================================
    // Semantic Graph
    // ===================================

    const graph =

      this.buildGraph({

        semanticIntent,

        recommendations:
          runtimeRecommendations,

      })

    // ===================================
    // Metrics
    // ===================================

    const metrics = {

      messages:
        messages.length,

      recommendations:
        runtimeRecommendations
          .length,

      graphNodes:
        graph.nodes.length,

      graphEdges:
        graph.edges.length,

    }

    // ===================================
    // Debug
    // ===================================

    console.log(
      '🔥 Orchestration Kernel'
    )

    console.log({

      semanticIntent,

      route,

      metrics,

    })

    // ===================================
    // Runtime Result
    // ===================================

    return {

      semanticIntent,

      recommendations:
        runtimeRecommendations,

      route,

      graph,

      metrics,

    }
  },
}

export default OrchestrationKernel