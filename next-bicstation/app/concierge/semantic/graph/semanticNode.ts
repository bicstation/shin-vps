// /app/concierge/semantic/graph/semanticNode.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticAttribute,
} from '@/app/concierge/contracts/semantic/SemanticPayload'

/* =========================================
🔥 Semantic Node
========================================= */

export class SemanticNode {

  attribute: SemanticAttribute
  connectedNodes: SemanticNode[]

  constructor(attribute: SemanticAttribute) {
    this.attribute = attribute
    this.connectedNodes = []
  }

  /* ======================================
  Connect to another node
  ====================================== */
  connect(node: SemanticNode) {
    if (!this.connectedNodes.includes(node)) {
      this.connectedNodes.push(node)
      node.connectedNodes.push(this)
    }
  }

  /* ======================================
  Check if connected
  ====================================== */
  isConnected(node: SemanticNode): boolean {
    return this.connectedNodes.includes(node)
  }
}