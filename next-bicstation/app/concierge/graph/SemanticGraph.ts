// /app/concierge/graph/SemanticGraph.ts

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
🔥 RUNTIME
========================================= */

import GraphRuntime, {
  type RuntimeGraph,
} from './runtime/GraphRuntime'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticGraphDomain
  from '@/app/concierge/domain/semantic/semanticGraphDomain'

/* =========================================
🔥 Semantic Graph
========================================= */

export const SemanticGraph = {

  /* =====================================
  Build Graph
  ===================================== */

  build({
    semanticIntent,
    recommendations,
  }: {
    semanticIntent?:
      SemanticIntent

    recommendations?:
      RecommendationPayload[]
  }): RuntimeGraph {

    return GraphRuntime
      .buildRuntimeGraph({

        semanticIntent,

        recommendations,

      })
  },

  /* =====================================
  Build Domain Graph
  ===================================== */

  buildDomainGraph({
    semanticIntent,
    recommendations,
  }: {
    semanticIntent?:
      SemanticIntent

    recommendations?:
      RecommendationPayload[]
  }) {

    return SemanticGraphDomain
      .buildSemanticGraph({

        semanticIntent,

        recommendations:
          recommendations || [],

      })
  },

  /* =====================================
  Resolve Connected Products
  ===================================== */

  resolveConnectedProducts({
    semanticIntent,
    recommendations,
  }: {
    semanticIntent?:
      SemanticIntent

    recommendations?:
      RecommendationPayload[]
  }) {

    const graph =

      this.buildDomainGraph({

        semanticIntent,

        recommendations,

      })

    return SemanticGraphDomain
      .resolveConnectedProducts({

        graph,

        usage:
          semanticIntent?.usage,

      })
  },

  /* =====================================
  Graph Metrics
  ===================================== */

  metrics({
    semanticIntent,
    recommendations,
  }: {
    semanticIntent?:
      SemanticIntent

    recommendations?:
      RecommendationPayload[]
  }) {

    const graph =

      this.build({

        semanticIntent,

        recommendations,

      })

    return GraphRuntime
      .buildGraphMetrics(
        graph
      )
  },

  /* =====================================
  Debug
  ===================================== */

  debug({
    semanticIntent,
    recommendations,
  }: {
    semanticIntent?:
      SemanticIntent

    recommendations?:
      RecommendationPayload[]
  }) {

    const graph =

      this.build({

        semanticIntent,

        recommendations,

      })

    const metrics =

      GraphRuntime
        .buildGraphMetrics(
          graph
        )

    console.log(
      '🔥 Semantic Graph'
    )

    console.log({

      usage:
        semanticIntent?.usage,

      metrics,

      nodes:
        graph.nodes,

      edges:
        graph.edges,

    })

    return {

      graph,

      metrics,

    }
  },
}

export default SemanticGraph