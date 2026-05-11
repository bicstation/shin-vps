// /app/concierge/types/chat/session.ts

/* =========================================
🔥 CHAT SESSION TYPES
========================================= */

import type { ConversationMessage } from './message'

export type ChatSession = {
  sessionId: string
  userId: string
  messages: ConversationMessage[]
  createdAt: string
  updatedAt?: string
}