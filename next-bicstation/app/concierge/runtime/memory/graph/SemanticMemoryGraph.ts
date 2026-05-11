// /app/concierge/runtime/memory/graph/SemanticMemoryGraph.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

import type {
  SemanticMemoryState,
} from '@/app/concierge/contracts/semantic/SemanticMemoryState'

/* =========================================
🔥 SEMANTIC MEMORY NODE
========================================= */

export type SemanticMemoryNode = {
  id: string
  semanticIntent: SemanticIntent
  prev?: SemanticMemoryNode
  next?: SemanticMemoryNode
}

/* =========================================
🔥 Semantic Memory Graph
========================================= */

export class SemanticMemoryGraph {

  nodes: SemanticMemoryNode[] = []

  constructor(memories: SemanticMemoryState[] = []) {
    this.nodes = memories.map((mem, idx) => ({
      id: `${idx}-${mem.semanticIntent?.usage || 'unknown'}`,
      semanticIntent: mem.semanticIntent!,
    }))

    for (let i = 1; i < this.nodes.length; i++) {
      this.nodes[i].prev = this.nodes[i - 1]
      this.nodes[i - 1].next = this.nodes[i]
    }
  }

  getLatestNode(): SemanticMemoryNode | null {
    return this.nodes.length > 0
      ? this.nodes[this.nodes.length - 1]
      : null
  }

  addNode(semanticIntent: SemanticIntent) {
    const idx = this.nodes.length
    const node: SemanticMemoryNode = {
      id: `${idx}-${semanticIntent.usage || 'unknown'}`,
      semanticIntent,
      prev: this.nodes[idx - 1],
    }
    if (this.nodes[idx - 1]) {
      this.nodes[idx - 1].next = node
    }
    this.nodes.push(node)
  }
}