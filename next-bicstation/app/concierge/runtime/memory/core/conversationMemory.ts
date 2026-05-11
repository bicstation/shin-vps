// /app/concierge/runtime/memory/core/conversationMemory.ts

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
🔥 Conversation Memory
========================================= */

export function
appendMessageToConversationMemory({
  state,
  message,
}: {
  state: ConversationState
  message: ConversationMessage
}): ConversationState {

  return ConversationDomain.appendMessage({
    state,
    message,
  })
}

/* =========================================
🔥 Normalize Conversation Memory
========================================= */

export function
normalizeConversationMemory(
  messages: ConversationMessage[] = []
): ConversationMessage[] {

  return ConversationDomain.normalizeMessages(
    messages
  )
}