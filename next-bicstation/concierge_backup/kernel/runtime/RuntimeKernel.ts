// /app/concierge/kernel/runtime/RuntimeKernel.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../contracts/conversation/ConversationMessage'

import type {
  ConversationState,
} from '../../contracts/conversation/ConversationState'

import type {
  RecommendationPayload,
} from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 DOMAIN
========================================= */

import ConversationDomain
  from '../../domain/chat/conversationDomain'

/* =========================================
🔥 KERNEL
========================================= */

import OrchestrationKernel
  from '../orchestration/OrchestrationKernel'

/* =========================================
🔥 Runtime Result
========================================= */

export type RuntimeKernelResult = {

  state:
    ConversationState

  semanticIntent?: any

  recommendations:
    RecommendationPayload[]

  route?: any

  graph?: any

  metrics?: any
}

/* =========================================
🔥 Runtime Kernel
========================================= */

export const RuntimeKernel = {

  /* =====================================
  Create Runtime State
  ===================================== */

  createRuntimeState():
    ConversationState {

    return ConversationDomain
      .createInitialState()
  },

  /* =====================================
  Append User Message
  ===================================== */

  appendUserMessage({
    state,
    content,
  }: {
    state:
      ConversationState

    content:
      string
  }): ConversationState {

    const message =

      ConversationDomain
        .createUserMessage(
          content
        )

    return ConversationDomain
      .appendMessage({

        state,

        message,

      })
  },

  /* =====================================
  Append Assistant Message
  ===================================== */

  appendAssistantMessage({
    state,
    content,
  }: {
    state:
      ConversationState

    content:
      string
  }): ConversationState {

    const message =

      ConversationDomain
        .createAssistantMessage(
          content
        )

    return ConversationDomain
      .appendMessage({

        state,

        message,

      })
  },

  /* =====================================
  Execute Runtime
  ===================================== */

  execute({
    state,
    recommendations,
  }: {
    state:
      ConversationState

    recommendations:
      RecommendationPayload[]
  }): RuntimeKernelResult {

    const messages =

      state?.messages || []

    // ===================================
    // Runtime Status
    // ===================================

    const processingState =

      ConversationDomain
        .setProcessing(
          state
        )

    // ===================================
    // Orchestration
    // ===================================

    const runtime =

      OrchestrationKernel
        .execute({

          messages,

          recommendations,

        })

    // ===================================
    // Runtime Complete
    // ===================================

    const successState =

      ConversationDomain
        .setSuccess(
          processingState
        )

    // ===================================
    // Debug
    // ===================================

    console.log(
      '🔥 Runtime Kernel'
    )

    console.log({

      status:
        successState.status,

      messages:
        messages.length,

      recommendations:
        runtime
          ?.recommendations
          ?.length || 0,

    })

    // ===================================
    // Runtime Result
    // ===================================

    return {

      state:
        successState,

      semanticIntent:
        runtime.semanticIntent,

      recommendations:
        runtime.recommendations,

      route:
        runtime.route,

      graph:
        runtime.graph,

      metrics:
        runtime.metrics,

    }
  },

  /* =====================================
  Execute Message Runtime
  ===================================== */

  executeMessage({
    state,
    content,
    recommendations,
  }: {
    state:
      ConversationState

    content:
      string

    recommendations:
      RecommendationPayload[]
  }) {

    // ===================================
    // Append User Message
    // ===================================

    const updatedState =

      this.appendUserMessage({

        state,

        content,

      })

    // ===================================
    // Execute Runtime
    // ===================================

    return this.execute({

      state:
        updatedState,

      recommendations,

    })
  },

  /* =====================================
  Normalize Messages
  ===================================== */

  normalizeMessages(
    messages:
      ConversationMessage[] = []
  ) {

    return ConversationDomain
      .normalizeMessages(
        messages
      )
  },
}

export default RuntimeKernel