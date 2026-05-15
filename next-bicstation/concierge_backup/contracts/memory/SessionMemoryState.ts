// /app/concierge/contracts/memory/SessionMemoryState.ts

/* =========================================
🔥 Session Memory State Contract
========================================= */

import type { ConversationMessage } from '../../contracts/conversation/ConversationMessage'
import type { SemanticIntent } from '../../contracts/semantic/SemanticIntent'
import type { UserPreference } from '../../contracts/user/UserPreference'

export type SessionMemoryState = {
  sessionId: string

  userId: string

  messages: ConversationMessage[]

  semanticIntents?: SemanticIntent[]

  userPreferences?: UserPreference

  metadata?: Record<string, any>

  createdAt: string
  updatedAt?: string
}