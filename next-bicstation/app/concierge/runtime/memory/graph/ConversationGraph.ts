// /app/concierge/runtime/memory/graph/ConversationGraph.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

/* =========================================
🔥 GRAPH NODE
========================================= */

export type ConversationNode = {
  id: string
  message: ConversationMessage
  prev?: ConversationNode
  next?: ConversationNode
}

/* =========================================
🔥 Conversation Graph
========================================= */

export class ConversationGraph {

  nodes: ConversationNode[] = []

  constructor(messages: ConversationMessage[] = []) {
    this.nodes = messages.map((msg, idx) => ({
      id: `${idx}-${msg.role}-${msg.content.slice(0, 10)}`,
      message: msg,
    }))

    for (let i = 1; i < this.nodes.length; i++) {
      this.nodes[i].prev = this.nodes[i - 1]
      this.nodes[i - 1].next = this.nodes[i]
    }
  }

  getLatestNode(): ConversationNode | null {
    return this.nodes.length > 0
      ? this.nodes[this.nodes.length - 1]
      : null
  }

  getUserNodes(): ConversationNode[] {
    return this.nodes.filter(n => n.message.role === 'user')
  }

  getAssistantNodes(): ConversationNode[] {
    return this.nodes.filter(n => n.message.role === 'assistant')
  }

  addNode(message: ConversationMessage) {
    const idx = this.nodes.length
    const node: ConversationNode = {
      id: `${idx}-${message.role}-${message.content.slice(0, 10)}`,
      message,
      prev: this.nodes[idx - 1],
    }
    if (this.nodes[idx - 1]) {
      this.nodes[idx - 1].next = node
    }
    this.nodes.push(node)
  }
}