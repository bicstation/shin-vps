// /app/concierge/contracts/conversation/ConversationMemory.ts

/* =========================================
🔥 Conversation Memory Contract
========================================= */

export type ConversationMemory = {
  sessionId: string
  userId: string
  messages: {
    id: string
    role: 'user' | 'system' | 'assistant'
    content: string
    timestamp: string
  }[]
  lastUpdated: string
}