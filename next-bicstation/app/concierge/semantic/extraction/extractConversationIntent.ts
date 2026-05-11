// /app/concierge/semantic/extraction/extractConversationIntent.ts

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
🔥 Extract Conversation Intent
========================================= */

export function extractConversationIntent(
  messages: ConversationMessage[] = []
): SemanticIntent {

  const latestMessage =
    messages[messages.length - 1]

  return {
    usage: latestMessage?.usage || undefined,
    gpu: latestMessage?.gpu || undefined,
    cpu: latestMessage?.cpu || undefined,
    maker: latestMessage?.maker || undefined,
    memory: latestMessage?.memory || undefined,
    storage: latestMessage?.storage || undefined,
    resolution: latestMessage?.resolution || undefined,
    panel: latestMessage?.panel || undefined,
    workload: latestMessage?.workload || undefined,
    ai: latestMessage?.ai || undefined,
    budget: latestMessage?.budget || undefined,
  }
}