// /app/concierge/contracts/conversation/ConversationIntent.ts

/* =========================================
🔥 Conversation Intent Contract
========================================= */

export type ConversationIntent = {
  intentId: string
  sessionId: string
  userId: string
  type: 'usage' | 'gpu' | 'cpu' | 'maker' | 'memory' | 'storage' | 'workload' | 'ai'
  value: string
  confidence?: number
  timestamp?: string
}