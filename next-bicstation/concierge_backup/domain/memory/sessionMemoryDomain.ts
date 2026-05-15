// /home/maya/shin-dev/shin-vps/next-bicstation/app/concierge/domain/memory/sessionMemoryDomain.ts// /app/concierge/domain/memory/sessionMemoryDomain.ts

/* =========================================
🔥 SESSION MEMORY DOMAIN
========================================= */

import type { SessionMemoryState } from '../../contracts/memory/SessionMemoryState'
import type { ConversationMessage } from '../../contracts/conversation/ConversationMessage'
import type { SemanticIntent } from '../../contracts/semantic/SemanticIntent'
import type { UserPreference } from '../../contracts/user/UserPreference'

/* =========================================
🔥 Create Initial Session Memory
========================================= */

export function createSessionMemoryState(
  sessionId: string,
  userId: string
): SessionMemoryState {
  return {
    sessionId,
    userId,

    messages: [],

    semanticIntents: [],

    metadata: {},

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/* =========================================
🔥 Add Conversation Message
========================================= */

export function addConversationMessage(
  state: SessionMemoryState,
  message: ConversationMessage
): SessionMemoryState {
  return {
    ...state,

    messages: [
      ...state.messages,
      message,
    ],

    updatedAt: new Date().toISOString(),
  }
}

/* =========================================
🔥 Add Semantic Intent
========================================= */

export function addSemanticIntent(
  state: SessionMemoryState,
  intent: SemanticIntent
): SessionMemoryState {
  return {
    ...state,

    semanticIntents: [
      ...(state.semanticIntents || []),
      intent,
    ],

    updatedAt: new Date().toISOString(),
  }
}

/* =========================================
🔥 Update User Preferences
========================================= */

export function updateUserPreferences(
  state: SessionMemoryState,
  preferences: UserPreference
): SessionMemoryState {
  return {
    ...state,

    userPreferences: {
      ...state.userPreferences,
      ...preferences,
    },

    updatedAt: new Date().toISOString(),
  }
}

/* =========================================
🔥 Update Metadata
========================================= */

export function updateSessionMetadata(
  state: SessionMemoryState,
  metadata: Record<string, any>
): SessionMemoryState {
  return {
    ...state,

    metadata: {
      ...state.metadata,
      ...metadata,
    },

    updatedAt: new Date().toISOString(),
  }
}