// /app/concierge/runtime/chat/core/chatSessionRuntime.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

import type {
  ConversationState,
} from '@/app/concierge/contracts/conversation/ConversationState'

/* =========================================
🔥 DOMAIN
========================================= */

import ConversationDomain
  from '@/app/concierge/domain/chat/conversationDomain'

/* =========================================
🔥 TYPES
========================================= */

export type ChatSessionResult = {

  state:
    ConversationState

  messages:
    ConversationMessage[]

  metrics: {

    totalMessages:
      number

    userMessages:
      number

    assistantMessages:
      number
  }
}

/* =========================================
🔥 Create Session
========================================= */

export function
createChatSession():
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
🔥 Execute Session
========================================= */

export function
executeChatSession({
  state,
}: {
  state:
    ConversationState
}): ChatSessionResult {

  const messages =

    ConversationDomain
      .normalizeMessages(
        state.messages
      )

  const userMessages =
    messages.filter(
      item => item?.role === 'user'
    )

  const assistantMessages =
    messages.filter(
      item => item?.role === 'assistant'
    )

  const metrics = {

    totalMessages:
      messages.length,

    userMessages:
      userMessages.length,

    assistantMessages:
      assistantMessages.length,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Chat Session Runtime'
  )

  console.log(metrics)

  return {

    state,

    messages,

    metrics,
  }
}