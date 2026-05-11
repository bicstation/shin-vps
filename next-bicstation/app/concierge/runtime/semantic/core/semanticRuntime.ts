// /app/concierge/runtime/semantic/core/semanticRuntime.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../../contracts/conversation/ConversationMessage'

import type {
  SemanticIntent,
} from '../../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticDomain
  from '../../../domain/semantic/semanticDomain'

/* =========================================
🔥 TYPES
========================================= */

export type SemanticRuntimeResult = {

  semanticIntent?:
    SemanticIntent

  summary:
    string

  metrics: {

    totalMessages:
      number

    usage?: string

    budget?: string | number

    gpu?: string
  }
}

/* =========================================
🔥 Execute Semantic Runtime
========================================= */

export function
executeSemanticRuntime({
  messages = [],
}: {
  messages?:
    ConversationMessage[]
}): SemanticRuntimeResult {

  // ======================================
  // Semantic Intent
  // ======================================

  const semanticIntent =

    SemanticDomain
      .resolveSemanticIntent(
        messages
      )

  // ======================================
  // Semantic Summary
  // ======================================

  const summary =

    SemanticDomain
      .buildSemanticSummary(
        semanticIntent
      )

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    totalMessages:
      messages.length,

    usage:
      semanticIntent
        ?.usage,

    budget:
      semanticIntent
        ?.budget,

    gpu:
      semanticIntent
        ?.gpu,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Runtime'
  )

  console.log({

    summary,

    metrics,

  })

  // ======================================
  // Result
  // ======================================

  return {

    semanticIntent,

    summary,

    metrics,
  }
}