// /app/concierge/runtime/memory/memoryRuntime.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../contracts/conversation/ConversationMessage'

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

import type {
  SemanticMemoryState,
} from '../../contracts/semantic/SemanticMemoryState'

/* =========================================
🔥 CORE
========================================= */

import {
  createSemanticMemory,
  updateSemanticMemory,
  resolveSemanticMemory,
} from './core/semanticMemory'

/* =========================================
🔥 ALGORITHMS
========================================= */

import {
  resolveConversationContext,
} from './algorithms/resolveConversationContext'

/* =========================================
🔥 GRAPH
========================================= */

import {
  ConversationGraph,
} from './graph/ConversationGraph'

import {
  SemanticMemoryGraph,
} from './graph/SemanticMemoryGraph'

/* =========================================
🔥 TYPES
========================================= */

export type MemoryRuntimeResult = {

  semanticMemory:
    SemanticMemoryState

  context:
    ReturnType<
      typeof resolveConversationContext
    >

  conversationGraph:
    ConversationGraph

  semanticGraph:
    SemanticMemoryGraph

  metrics: {

    totalMessages:
      number

    semanticNodes:
      number

    conversationNodes:
      number
  }
}

/* =========================================
🔥 Execute Memory Runtime
========================================= */

export function
executeMemoryRuntime({
  messages = [],
  semanticIntent,
}: {
  messages?:
    ConversationMessage[]

  semanticIntent?:
    SemanticIntent
}): MemoryRuntimeResult {

  // ======================================
  // Conversation Context
  // ======================================

  const context =

    resolveConversationContext(
      messages
    )

  // ======================================
  // Semantic Memory
  // ======================================

  let semanticMemory =

    createSemanticMemory()

  if (
    semanticIntent
  ) {

    semanticMemory =

      updateSemanticMemory({

        state:
          semanticMemory,

        semanticIntent,

      })
  }

  // ======================================
  // Graph Runtime
  // ======================================

  const conversationGraph =

    new ConversationGraph(
      messages
    )

  const semanticGraph =

    new SemanticMemoryGraph([
      semanticMemory,
    ])

  // ======================================
  // Memory Resolve
  // ======================================

  const resolved =

    resolveSemanticMemory({

      state:
        semanticMemory,

    })

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    totalMessages:
      messages.length,

    semanticNodes:

      semanticGraph.nodes
        ?.length || 0,

    conversationNodes:

      conversationGraph.nodes
        ?.length || 0,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Memory Runtime'
  )

  console.log({

    usage:
      resolved
        ?.semanticIntent
        ?.usage,

    metrics,

  })

  // ======================================
  // Result
  // ======================================

  return {

    semanticMemory,

    context,

    conversationGraph,

    semanticGraph,

    metrics,
  }
}