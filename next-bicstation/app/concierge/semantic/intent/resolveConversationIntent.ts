// /app/concierge/semantic/intent/resolveConversationIntent.ts

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
🔥 Resolve Conversation Intent
========================================= */

export function resolveConversationIntent(
  messages: ConversationMessage[]
): SemanticIntent {

  const latestMessage =
    messages[messages.length - 1]

  return {
    usage: latestMessage?.usage,
    gpu: latestMessage?.gpu,
    cpu: latestMessage?.cpu,
    maker: latestMessage?.maker,
    memory: latestMessage?.memory,
    storage: latestMessage?.storage,
    resolution: latestMessage?.resolution,
    panel: latestMessage?.panel,
    workload: latestMessage?.workload,
    ai: latestMessage?.ai,
    budget: latestMessage?.budget,
  }
}