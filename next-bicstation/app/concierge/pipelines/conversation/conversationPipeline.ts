// /app/concierge/pipelines/conversation/conversationPipeline.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../contracts/conversation/ConversationMessage'

import type {
  ConversationState,
} from '../../contracts/conversation/ConversationState'

/* =========================================
🔥 DOMAIN
========================================= */

import ConversationDomain
  from '../../domain/chat/conversationDomain'

/* =========================================
🔥 PIPELINE RESULT
========================================= */

export type ConversationPipelineResult = {

  state:
    ConversationState

  latestMessage?:
    ConversationMessage

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
🔥 Create Pipeline State
========================================= */

export function
createConversationPipelineState():
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
🔥 Build Metrics
========================================= */

export function
buildConversationMetrics(
  messages:
    ConversationMessage[] = []
) {

  const userMessages =

    messages.filter(
      item => (
        item?.role
        === 'user'
      )
    )

  const assistantMessages =

    messages.filter(
      item => (
        item?.role
        === 'assistant'
      )
    )

  return {

    totalMessages:
      messages.length,

    userMessages:
      userMessages.length,

    assistantMessages:
      assistantMessages.length,

  }
}

/* =========================================
🔥 Execute Conversation Pipeline
========================================= */

export function
executeConversationPipeline({
  state,
}: {
  state:
    ConversationState
}): ConversationPipelineResult {

  const normalizedMessages =

    ConversationDomain
      .normalizeMessages(
        state.messages
      )

  const latestMessage =

    ConversationDomain
      .getLatestMessage(
        normalizedMessages
      )

  const metrics =

    buildConversationMetrics(
      normalizedMessages
    )

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Conversation Pipeline'
  )

  console.log({

    latestRole:
      latestMessage?.role,

    metrics,

  })

  // ======================================
  // Result
  // ======================================

  return {

    state: {

      ...state,

      messages:
        normalizedMessages,

    },

    latestMessage,

    metrics,

  }
}