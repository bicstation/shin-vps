// /app/concierge/kernel/semantic/SemanticKernel.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticDomain
  from '@/app/concierge/domain/semantic/semanticDomain'

import RoutingDomain
  from '@/app/concierge/domain/routing/routingDomain'

/* =========================================
🔥 GRAPH
========================================= */

import SemanticGraph
  from '@/app/concierge/graph/SemanticGraph'

/* =========================================
🔥 KERNEL RESULT
========================================= */

export type SemanticKernelResult = {

  semanticIntent:
    SemanticIntent

  summary:
    string

  route?: any

  graph?: any

  metrics?: any
}

/* =========================================
🔥 Semantic Kernel
========================================= */

export const SemanticKernel = {

  /* =====================================
  Resolve Semantic Intent
  ===================================== */

  resolveIntent(
    messages:
      ConversationMessage[] = []
  ): SemanticIntent {

    return SemanticDomain
      .resolveSemanticIntent(
        messages
      )
  },

  /* =====================================
  Build Semantic Summary
  ===================================== */

  buildSummary(
    semanticIntent?:
      SemanticIntent
  ) {

    return SemanticDomain
      .buildSemanticSummary(
        semanticIntent
      )
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

  buildGraph(
    semanticIntent?:
      SemanticIntent
  ) {

    return SemanticGraph
      .build({

        semanticIntent,

        recommendations: [],

      })
  },

  /* =====================================
  Execute Semantic Runtime
  ===================================== */

  execute({
    messages,
  }: {
    messages:
      ConversationMessage[]
  }): SemanticKernelResult {

    // ===================================
    // Semantic Intent
    // ===================================

    const semanticIntent =

      this.resolveIntent(
        messages
      )

    // ===================================
    // Summary
    // ===================================

    const summary =

      this.buildSummary(
        semanticIntent
      )

    // ===================================
    // Route
    // ===================================

    const route =

      this.resolveRoute(
        semanticIntent
      )

    // ===================================
    // Graph
    // ===================================

    const graph =

      this.buildGraph(
        semanticIntent
      )

    // ===================================
    // Metrics
    // ===================================

    const metrics = {

      nodeCount:
        graph?.nodes
          ?.length || 0,

      edgeCount:
        graph?.edges
          ?.length || 0,

      usage:
        semanticIntent
          ?.usage,

    }

    // ===================================
    // Debug
    // ===================================

    console.log(
      '🔥 Semantic Kernel'
    )

    console.log({

      semanticIntent,

      summary,

      route,

      metrics,

    })

    // ===================================
    // Runtime Result
    // ===================================

    return {

      semanticIntent,

      summary,

      route,

      graph,

      metrics,

    }
  },
}

export default SemanticKernel