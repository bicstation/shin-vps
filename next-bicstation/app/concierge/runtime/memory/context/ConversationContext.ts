// /app/concierge/runtime/memory/context/ConversationContext.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../../contracts/conversation/ConversationMessage'

/* =========================================
🔥 Conversation Context
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
🔥 Utility
========================================= */

export function
createConversationContext(
  messages: ConversationMessage[] = []
): ConversationContext {

  const latestMessage =
    messages.slice(-1)[0]

  const latestUserMessage =
    [...messages]
      .reverse()
      .find(
        m => m.role === 'user'
      )

  const latestAssistantMessage =
    [...messages]
      .reverse()
      .find(
        m => m.role === 'assistant'
      )

  return {

    latestMessage,
    latestUserMessage,
    latestAssistantMessage,
    totalMessages: messages.length,
  }
}