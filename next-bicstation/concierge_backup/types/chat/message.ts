// /app/concierge/types/chat/message.ts

/* =========================================
🔥 CONVERSATION MESSAGE TYPES
========================================= */

export type ConversationMessageRole =
  | 'user'
  | 'system'
  | 'assistant'

export type ConversationMessage = {
  id?: string
  role: ConversationMessageRole
  content: string
  created_at?: string
  updated_at?: string
  metadata?: Record<string, any>
}