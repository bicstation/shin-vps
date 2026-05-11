// /app/concierge/orchestration/conversation/ConversationIntentFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../contracts/conversation/ConversationMessage'

import type {
  SemanticIntent,
} from '../contracts/semantic/SemanticIntent'

/* =========================================
🔥 SEMANTIC
========================================= */

import {
  resolveConversationIntent,
} from '../semantic/intent/resolveConversationIntent'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?: ConversationMessage[]

  onResolved?: (
    intent: SemanticIntent
  ) => void
}

/* =========================================
🔥 Conversation Intent Flow
========================================= */

export default function
ConversationIntentFlow({
  messages = [],
  onResolved,
}: Props) {

  // ======================================
  // Safe Messages
  // ======================================

  const safeMessages =

    useMemo(() => (

      Array.isArray(messages)
        ? messages
        : []

    ), [messages])

  // ======================================
  // User Conversation
  // ======================================

  const userConversation =

    useMemo(() => (

      safeMessages.filter(
        item => (

          item?.role
          === 'user'

        )
      )

    ), [safeMessages])

  // ======================================
  // Semantic Intent
  // ======================================

  const semanticIntent =

    useMemo<
      SemanticIntent
    >(() => {

      try {

        return (
          resolveConversationIntent(
            userConversation
          )
        )

      } catch (error) {

        console.error(
          '🔥 Conversation Intent Error'
        )

        console.error(error)

        return {

          usage:
            'general',
        }
      }

    }, [userConversation])

  // ======================================
  // Callback
  // ======================================

  useMemo(() => {

    if (
      typeof onResolved
      === 'function'
    ) {

      onResolved(
        semanticIntent
      )
    }

  }, [

    semanticIntent,
    onResolved,

  ])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Conversation Intent Flow'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    gpu:
      semanticIntent?.gpu,

    budget:
      semanticIntent?.budget,

    ai:
      semanticIntent?.ai,

  })

  // ======================================
  // Flow Layer
  // ======================================

  return null
}