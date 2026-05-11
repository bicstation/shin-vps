// /app/concierge/runtime/chat/chatRuntime.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

import type {
  ConversationState,
} from '@/app/concierge/contracts/conversation/ConversationState'

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

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

  const messages =

    ConversationDomain
      .normalizeMessages(
        state.messages
      )

  const semanticIntent =

    SemanticDomain
      .resolveSemanticIntent(
        messages
      )

  const runtime =

    RuntimeKernel.execute({

      state: {

        ...state,

        messages,

      },

      recommendations: [],

    })

  const latestMessage =

    ConversationDomain
      .getLatestMessage(
        messages
      )

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

  return {

    state:
      runtime.state,

    messages,

    semanticIntent,

    metrics,
  }
}