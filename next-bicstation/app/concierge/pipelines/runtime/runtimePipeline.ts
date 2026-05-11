// /app/concierge/pipelines/runtime/runtimePipeline.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../contracts/conversation/ConversationMessage'

import type {
  RecommendationPayload,
} from '../../contracts/recommendation/RecommendationPayload'

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

import type {
  RuntimeState,
} from '../../contracts/runtime/RuntimeState'

/* =========================================
🔥 DOMAIN
========================================= */

import RuntimeKernel
  from '@/app/concierge/kernel/runtime/RuntimeKernel'

/* =========================================
🔥 PIPELINE RESULT
========================================= */

export type RuntimePipelineResult = {

  state:
    RuntimeState

  semanticIntent?:
    SemanticIntent

  recommendations:
    RecommendationPayload[]

  metrics: {

    totalMessages:
      number

    totalRecommendations:
      number
  }
}

/* =========================================
🔥 Execute Runtime Pipeline
========================================= */

export function
executeRuntimePipeline({
  state,
  messages = [],
  recommendations = [],
}: {
  state: RuntimeState
  messages?: ConversationMessage[]
  recommendations?: RecommendationPayload[]
}): RuntimePipelineResult {

  const runtime =

    RuntimeKernel.execute({

      state,
      messages,
      recommendations,

    })

  const semanticIntent =
    runtime?.semanticIntent

  const runtimeRecommendations =
    runtime?.recommendations || []

  const metrics = {

    totalMessages:
      messages.length,

    totalRecommendations:
      runtimeRecommendations.length,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Runtime Pipeline'
  )

  console.log({

    totalMessages: messages.length,
    totalRecommendations:
      runtimeRecommendations.length,
    usage:
      semanticIntent?.usage || null,
  })

  return {

    state: runtime?.state || state,
    semanticIntent,
    recommendations: runtimeRecommendations,
    metrics,
  }
}