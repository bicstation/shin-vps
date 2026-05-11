// /app/concierge/runtime/chat/core/chatRuntime.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../../contracts/conversation/ConversationMessage'

import type {
  ConversationState,
} from '../../../contracts/conversation/ConversationState'

import type {
  SemanticIntent,
} from '../../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import ConversationDomain
  from '@/app/concierge/domain/chat/conversationDomain'

import SemanticDomain
  from '@/app/concierge/domain/semantic/semanticDomain'

/* =========================================
🔥 KERNEL
========================================= */

import RuntimeKernel
  from '@/app/concierge/kernel/runtime/RuntimeKernel'

/* =========================================
🔥 TYPES
========================================= */

export type ChatRuntimeResult = {

  state:
    ConversationState

  messages:
    ConversationMessage[]

  semanticIntent?:
    SemanticIntent

  metrics: {

    totalMessages:
      number

    latestRole?:
      string
  }
}

/* =========================================
🔥 Create Chat Runtime
========================================= */

export function
createChatRuntime():
ConversationState {

  return ConversationDomain
    .createInitialState()
}

/* =========================================
🔥 Append User Message
========================================= */

export function
appendUserMessage({
  state,
  content,
}: {
  state:
    ConversationState

  content:
    string
}) {

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
}

/* =========================================
🔥 Append Assistant Message
========================================= */

export function
appendAssistantMessage({
  state,
  content,
}: {
  state:
    ConversationState

  content:
    string
}) {

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
}

/* =========================================
🔥 Execute Chat Runtime
========================================= */

export function
executeChatRuntime({
  state,
}: {
  state:
    ConversationState
}): ChatRuntimeResult {

  // ======================================
  // Normalize Messages
  // ======================================

  const messages =

    ConversationDomain
      .normalizeMessages(
        state.messages
      )

  // ======================================
  // Semantic Intent
  // ======================================

  const semanticIntent =

    SemanticDomain
      .resolveSemanticIntent(
        messages
      )

  // ======================================
  // Runtime
  // ======================================

  const runtime =

    RuntimeKernel.execute({

      state: {

        ...state,

        messages,

      },

      recommendations: [],

    })

  // ======================================
  // Latest Message
  // ======================================

  const latestMessage =

    ConversationDomain
      .getLatestMessage(
        messages
      )

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    totalMessages:
      messages.length,

    latestRole:
      latestMessage?.role,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Chat Runtime'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    metrics,

  })

  // ======================================
  // Result
  // ======================================

  return {

    state:
      runtime.state,

    messages,

    semanticIntent,

    metrics,

  }
}