// /app/concierge/types/chat/state.ts

/* =========================================
🔥 CHAT STATE TYPES
========================================= */

import type { ConversationMessage } from './message'

export type ChatState = {
  messages: ConversationMessage[]
  activeSessionId?: string
  loading: boolean
}