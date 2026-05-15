// /app/concierge/contracts/conversation/ConversationState.ts

/* =========================================
🔥 Conversation State Contract
========================================= */

export type ConversationState = {
  sessionId: string
  userId: string
  messages: ConversationMessage[]
  activeSessionId?: string
  loading: boolean
}