// /app/concierge/runtime/memory/algorithms/resolveConversationContext.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

/* =========================================
🔥 TYPES
========================================= */

export type ConversationContext = {

  latestMessage?:
    ConversationMessage

  latestUserMessage?:
    ConversationMessage

  latestAssistantMessage?:
    ConversationMessage

  totalMessages:
    number
}

/* =========================================
🔥 Resolve Conversation Context
========================================= */

export function
resolveConversationContext(
  messages:
    ConversationMessage[] = []
): ConversationContext {

  // ======================================
  // Latest Message
  // ======================================

  const latestMessage =

    messages?.slice(-1)?.[0]

  // ======================================
  // Latest User Message
  // ======================================

  const latestUserMessage =

    [...messages]
      .reverse()
      .find(
        item => (
          item?.role
          === 'user'
        )
      )

  // ======================================
  // Latest Assistant Message
  // ======================================

  const latestAssistantMessage =

    [...messages]
      .reverse()
      .find(
        item => (
          item?.role
          === 'assistant'
        )
      )

  // ======================================
  // Metrics
  // ======================================

  const totalMessages =
    messages.length

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Resolve Conversation Context'
  )

  console.log({

    totalMessages,

    latestRole:
      latestMessage?.role,

  })

  // ======================================
  // Result
  // ======================================

  return {

    latestMessage,

    latestUserMessage,

    latestAssistantMessage,

    totalMessages,
  }
}