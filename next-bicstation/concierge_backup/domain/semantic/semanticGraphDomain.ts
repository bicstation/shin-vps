// /app/concierge/domain/semantic/semanticGraphDomain.ts
// /app/concierge/domain/semantic/semanticGraphDomain.ts

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
🔥 Types
========================================= */

export type SemanticNode = {

  id: string

  type:
    | 'usage'
    | 'gpu'
    | 'budget'
    | 'product'
    | 'recommendation'
    | 'memory'

  label: string

  value?: any
}

export type SemanticEdge = {

  from: string

  to: string

  relation:
    | 'matches'
    | 'recommends'
    | 'depends_on'
    | 'related_to'
}

/* =========================================
🔥 Semantic Graph Domain
========================================= */

export const SemanticGraphDomain = {

  /* =====================================
  Create Node
  ===================================== */

  createNode({
    id,
    type,
    label,
    value,
  }: SemanticNode): SemanticNode {

    return {

      id,
      type,
      label,
      value,

    }
  },

  /* =====================================
  Create Edge
  ===================================== */

  createEdge({
    from,
    to,
    relation,
  }: SemanticEdge): SemanticEdge {

    return {

      from,
      to,
      relation,

    }
  },

  /* =====================================
  Build Intent Nodes
  ===================================== */

  buildIntentNodes(
    semanticIntent?:
      SemanticIntent
  ): SemanticNode[] {

    if (
      !semanticIntent
    ) {

      return []
    }

    const nodes:
      SemanticNode[] = []

    // ===================================
    // Usage
    // ===================================

    if (
      semanticIntent?.usage
    ) {

      nodes.push({

        id:
          `usage-${semanticIntent.usage}`,

        type:
          'usage',

        label:
          semanticIntent.usage,

        value:
          semanticIntent.usage,

      })
    }

    // ===================================
    // GPU
    // ===================================

    if (
      semanticIntent?.gpu
    ) {

      nodes.push({

        id:
          `gpu-${semanticIntent.gpu}`,

        type:
          'gpu',

        label:
          semanticIntent.gpu,

        value:
          semanticIntent.gpu,

      })
    }

    // ===================================
    // Budget
    // ===================================

    if (
      semanticIntent?.budget
    ) {

      nodes.push({

        id:
          `budget-${semanticIntent.budget}`,

        type:
          'budget',

        label:
          `¥${semanticIntent.budget.toLocaleString()}`,

        value:
          semanticIntent.budget,

      })
    }

    return nodes
  },

  /* =====================================
  Build Product Nodes
  ===================================== */

  buildProductNodes(
    recommendations:
      RecommendationPayload[] = []
  ): SemanticNode[] {

    return recommendations.map(
      item => ({

        id:
          item?.unique_id
          || crypto.randomUUID(),

        type:
          'product',

        label:
          item?.name
          || 'unknown_product',

        value:
          item,

      })
    )
  },

  /* =====================================
  Build Recommendation Edges
  ===================================== */

  buildRecommendationEdges({
    semanticIntent,
    recommendations,
  }: {
    semanticIntent?:
      SemanticIntent

    recommendations:
      RecommendationPayload[]
  }): SemanticEdge[] {

    if (
      !semanticIntent?.usage
    ) {

      return []
    }

    return recommendations.map(
      item => ({

        from:
          `usage-${semanticIntent.usage}`,

        to:
          item?.unique_id
          || 'unknown_product',

        relation:
          'recommends',

      })
    )
  },

  /* =====================================
  Build Semantic Graph
  ===================================== */

  buildSemanticGraph({
    semanticIntent,
    recommendations,
  }: {
    semanticIntent?:
      SemanticIntent

    recommendations:
      RecommendationPayload[]
  }) {

    const intentNodes =

      this.buildIntentNodes(
        semanticIntent
      )

    const productNodes =

      this.buildProductNodes(
        recommendations
      )

    const edges =

      this.buildRecommendationEdges({

        semanticIntent,

        recommendations,

      })

    return {

      nodes: [

        ...intentNodes,

        ...productNodes,

      ],

      edges,

    }
  },

  /* =====================================
  Resolve Connected Products
  ===================================== */

  resolveConnectedProducts({
    graph,
    usage,
  }: {
    graph: {
      nodes: SemanticNode[]
      edges: SemanticEdge[]
    }

    usage?: string
  }) {

    if (
      !usage
    ) {

      return []
    }

    const connectedIds =

      graph.edges
        .filter(
          edge => (

            edge.from
            === `usage-${usage}`

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
  Graph Summary
  ===================================== */

  buildGraphSummary(
    graph: {
      nodes: SemanticNode[]
      edges: SemanticEdge[]
    }
  ) {

    return {

      nodeCount:
        graph?.nodes?.length
        || 0,

      edgeCount:
        graph?.edges?.length
        || 0,

    }
  },
}

export default SemanticGraphDomain