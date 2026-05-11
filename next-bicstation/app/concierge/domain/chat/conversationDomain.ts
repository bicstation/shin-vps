// /app/concierge/domain/chat/conversationDomain.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../contracts/conversation/ConversationMessage'

import type {
  ConversationState,
} from '../../contracts/conversation/ConversationState'

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 Conversation Domain
========================================= */

export const ConversationDomain = {

  /* =====================================
  Initial State
  ===================================== */

  createInitialState():
    ConversationState {

    return {

      status:
        'idle',

      messages: [],

      error:
        null,

    }
  },

  /* =====================================
  Build User Message
  ===================================== */

  createUserMessage(
    content: string
  ): ConversationMessage {

    return {

      id:
        crypto.randomUUID(),

      role:
        'user',

      content,

      created_at:
        new Date()
          .toISOString(),

    }
  },

  /* =====================================
  Build Assistant Message
  ===================================== */

  createAssistantMessage(
    content: string
  ): ConversationMessage {

    return {

      id:
        crypto.randomUUID(),

      role:
        'assistant',

      content,

      created_at:
        new Date()
          .toISOString(),

    }
  },

  /* =====================================
  Append Message
  ===================================== */

  appendMessage({
    state,
    message,
  }: {
    state: ConversationState
    message: ConversationMessage
  }): ConversationState {

    return {

      ...state,

      messages: [

        ...(state?.messages || []),

        message,

      ],

    }
  },

  /* =====================================
  Set Processing
  ===================================== */

  setProcessing(
    state: ConversationState
  ): ConversationState {

    return {

      ...state,

      status:
        'processing',

    }
  },

  /* =====================================
  Set Success
  ===================================== */

  setSuccess(
    state: ConversationState
  ): ConversationState {

    return {

      ...state,

      status:
        'success',

      error:
        null,

    }
  },

  /* =====================================
  Set Error
  ===================================== */

  setError({
    state,
    error,
  }: {
    state: ConversationState
    error?: string
  }): ConversationState {

    return {

      ...state,

      status:
        'error',

      error:
        error || 'runtime_error',

    }
  },

  /* =====================================
  Resolve Latest User Message
  ===================================== */

  getLatestUserMessage(
    messages:
      ConversationMessage[] = []
  ) {

    const userMessages =

      messages.filter(
        item => (
          item?.role
          === 'user'
        )
      )

    return userMessages[
      userMessages.length - 1
    ]
  },

  /* =====================================
  Resolve Conversation Intent
  ===================================== */

  resolveConversationIntent(
    messages:
      ConversationMessage[] = []
  ): SemanticIntent {

    const latestMessage =

      this.getLatestUserMessage(
        messages
      )

    const content =

      latestMessage?.content
        ?.toLowerCase()
      || ''

    // ===================================
    // Gaming
    // ===================================

    if (

      content.includes('game')
      ||
      content.includes('gaming')
      ||
      content.includes('ゲーム')

    ) {

      return {

        usage:
          'gaming',
      }
    }

    // ===================================
    // Creator
    // ===================================

    if (

      content.includes('動画')
      ||
      content.includes('編集')
      ||
      content.includes('creator')

    ) {

      return {

        usage:
          'creator',
      }
    }

    // ===================================
    // AI
    // ===================================

    if (

      content.includes('ai')
      ||
      content.includes('生成')
      ||
      content.includes('llm')

    ) {

      return {

        usage:
          'ai',
      }
    }

    // ===================================
    // Business
    // ===================================

    if (

      content.includes('仕事')
      ||
      content.includes('office')
      ||
      content.includes('business')

    ) {

      return {

        usage:
          'business',
      }
    }

    // ===================================
    // Default
    // ===================================

    return {

      usage:
        'general',
    }
  },

  /* =====================================
  Normalize Messages
  ===================================== */

  normalizeMessages(
    messages:
      ConversationMessage[] = []
  ) {

    return Array.isArray(
      messages
    )
      ? messages
      : []
  },
}

export default ConversationDomain