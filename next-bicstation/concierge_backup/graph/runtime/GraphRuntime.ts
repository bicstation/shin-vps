// /app/concierge/graph/runtime/GraphRuntime.ts

/* =========================================
🔥 NODES
========================================= */

import type {
  ProductNode,
} from '../nodes/ProductNode'

import type {
  SemanticNode,
} from '../nodes/SemanticNode'

import type {
  UserIntentNode,
} from '../nodes/UserIntentNode'

/* =========================================
🔥 EDGES
========================================= */

import type {
  RecommendationEdge,
} from '../edges/RecommendationEdge'

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
🔥 FACTORIES
========================================= */

import {
  createProductNode,
} from '../nodes/ProductNode'

import {
  createSemanticNode,
} from '../nodes/SemanticNode'

import {
  createUserIntentNode,
} from '../nodes/UserIntentNode'

import {
  createRecommendationEdge,
} from '../edges/RecommendationEdge'

/* =========================================
🔥 Graph Runtime Types
========================================= */

export type RuntimeGraph = {

  nodes: Array<
    | ProductNode
    | SemanticNode
    | UserIntentNode
  >

  edges:
    RecommendationEdge[]
}

/* =========================================
🔥 Graph Runtime
========================================= */

export const GraphRuntime = {

  /* =====================================
  Create Empty Graph
  ===================================== */

  createGraph():
    RuntimeGraph {

    return {

      nodes: [],

      edges: [],

    }
  },

  /* =====================================
  Build Runtime Graph
  ===================================== */

  buildRuntimeGraph({
    semanticIntent,
    recommendations,
  }: {
    semanticIntent?:
      SemanticIntent

    recommendations?:
      RecommendationPayload[]
  }): RuntimeGraph {

    const graph =
      this.createGraph()

    // ===================================
    // Intent Node
    // ===================================

    if (
      semanticIntent
    ) {

      const intentNode =

        createUserIntentNode({

          intent:
            semanticIntent,

        })

      graph.nodes.push(
        intentNode
      )

      // =================================
      // Semantic Usage Node
      // =================================

      if (
        semanticIntent?.usage
      ) {

        const usageNode =

          createSemanticNode({

            type:
              'usage',

            label:
              semanticIntent.usage,

            value:
              semanticIntent.usage,

          })

        graph.nodes.push(
          usageNode
        )

        graph.edges.push(

          createRecommendationEdge({

            from:
              intentNode.id,

            to:
              usageNode.id,

            relation:
              'matches',

          })

        )
      }

      // =================================
      // GPU Node
      // =================================

      if (
        semanticIntent?.gpu
      ) {

        const gpuNode =

          createSemanticNode({

            type:
              'gpu',

            label:
              semanticIntent.gpu,

            value:
              semanticIntent.gpu,

          })

        graph.nodes.push(
          gpuNode
        )

        graph.edges.push(

          createRecommendationEdge({

            from:
              intentNode.id,

            to:
              gpuNode.id,

            relation:
              'depends_on',

          })

        )
      }
    }

    // ===================================
    // Product Nodes
    // ===================================

    recommendations?.forEach(
      recommendation => {

        const productNode =

          createProductNode({

            product:
              recommendation,

            score:
              recommendation
                ?.score,

          })

        graph.nodes.push(
          productNode
        )

        // ===============================
        // Recommendation Edge
        // ===============================

        if (
          semanticIntent?.usage
        ) {

          graph.edges.push(

            createRecommendationEdge({

              from:
                `intent-${semanticIntent.usage}`,

              to:
                productNode.id,

              relation:
                'recommends',

              weight:
                recommendation
                  ?.score
                || 1,

            })

          )
        }
      }
    )

    return graph
  },

  /* =====================================
  Resolve Connected Nodes
  ===================================== */

  getConnectedNodes({
    graph,
    nodeId,
  }: {
    graph:
      RuntimeGraph

    nodeId:
      string
  }) {

    const connectedIds =

      graph.edges
        .filter(
          edge => (

            edge.from
            === nodeId

          )
        )
        .map(
          edge => edge.to
        )

    return graph.nodes.filter(
      node => (

        connectedIds.includes(
          node.id
        )

      )
    )
  },

  /* =====================================
  Resolve Recommendation Nodes
  ===================================== */

  getRecommendationNodes(
    graph:
      RuntimeGraph
  ) {

    return graph.nodes.filter(
      node => (

        'type' in node
        &&
        node.type
        === 'product'

      )
    )
  },

  /* =====================================
  Resolve Semantic Nodes
  ===================================== */

  getSemanticNodes(
    graph:
      RuntimeGraph
  ) {

    return graph.nodes.filter(
      node => (

        'type' in node
        &&
        (
          node.type
          === 'usage'
          ||
          node.type
          === 'gpu'
          ||
          node.type
          === 'budget'
        )

      )
    )
  },

  /* =====================================
  Graph Metrics
  ===================================== */

  buildGraphMetrics(
    graph:
      RuntimeGraph
  ) {

    return {

      totalNodes:
        graph.nodes.length,

      totalEdges:
        graph.edges.length,

      recommendationNodes:

        this.getRecommendationNodes(
          graph
        ).length,

      semanticNodes:

        this.getSemanticNodes(
          graph
        ).length,

    }
  },
}

export default GraphRuntime