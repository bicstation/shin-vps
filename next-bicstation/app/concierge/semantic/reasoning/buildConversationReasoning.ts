// /app/concierge/semantic/reasoning/buildConversationReasoning.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 Build Conversation Reasoning
========================================= */

export function buildConversationReasoning({
  messages = [],
  semanticIntent,
}: {
  messages?: ConversationMessage[]
  semanticIntent?: SemanticIntent
}): string {

  const totalMessages = messages.length

  const usage = semanticIntent?.usage || '不明'
  const gpu = semanticIntent?.gpu || '不明'

  return `Conversation Summary:
  Messages Count: ${totalMessages}
  Primary Usage: ${usage}
  GPU: ${gpu}`
}