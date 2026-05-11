// /app/concierge/contracts/conversation/ConversationMessage.ts

/* =========================================
🔥 Conversation Message Contract
========================================= */

export type ConversationMessage = {
  messageId: string
  sessionId: string
  userId: string
  role: 'user' | 'system' | 'assistant'
  content: string
  metadata?: Record<string, any>
  timestamp: string
}