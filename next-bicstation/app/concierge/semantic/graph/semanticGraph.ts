// /app/concierge/semantic/graph/semanticGraph.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticPayload,
  SemanticAttribute,
} from '@/app/concierge/contracts/semantic/SemanticPayload'

/* =========================================
🔥 Semantic Graph
========================================= */

export class SemanticGraph {

  nodes: SemanticAttribute[]
  edges: Array<[string, string]>

  constructor(payload?: SemanticPayload) {

    this.nodes =
      payload?.attributes || []

    this.edges = []

    if (payload?.grouped_attributes) {
      for (const [group, attrs] of Object.entries(
        payload.grouped_attributes
      )) {
        for (let i = 0; i < attrs.length; i++) {
          for (let j = i + 1; j < attrs.length; j++) {
            this.edges.push([
              attrs[i].slug,
              attrs[j].slug,
            ])
          }
        }
      }
    }
  }

  /* ======================================
  Build graph from payload
  ====================================== */
  static build(payload?: SemanticPayload) {
    return new SemanticGraph(payload)
  }

  /* ======================================
  Find node by slug
  ====================================== */
  findNode(slug: string): SemanticAttribute | undefined {
    return this.nodes.find(n => n.slug === slug)
  }

  /* ======================================
  Add edge
  ====================================== */
  addEdge(from: string, to: string) {
    this.edges.push([from, to])
  }
}