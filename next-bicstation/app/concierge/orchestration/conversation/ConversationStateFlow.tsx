// /app/concierge/orchestration/conversation/ConversationStateFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationState,
} from '../contracts/conversation/ConversationState'

/* =========================================
🔥 Props
========================================= */

type Props = {

  state?: ConversationState

  onStateChange?: (
    state: ConversationState
  ) => void
}

/* =========================================
🔥 Conversation State Flow
========================================= */

export default function
ConversationStateFlow({
  state,
  onStateChange,
}: Props) {

  // ======================================
  // Safe State
  // ======================================

  const safeState =

    useMemo<
      ConversationState
    >(() => {

      return {

        status:
          state?.status
          || 'idle',

        messages:
          Array.isArray(
            state?.messages
          )
            ? state.messages
            : [],

        error:
          state?.error
          || null,

      }

    }, [state])

  // ======================================
  // Derived State
  // ======================================

  const derivedState =

    useMemo(() => {

      const messages =
        safeState.messages || []

      const latestMessage =

        messages[
          messages.length - 1
        ]

      const isProcessing =

        safeState.status
        === 'processing'

      const hasMessages =

        messages.length > 0

      const hasError =

        !!safeState.error

      return {

        latestMessage,

        isProcessing,

        hasMessages,

        hasError,

      }

    }, [safeState])

  // ======================================
  // Runtime Callback
  // ======================================

  useMemo(() => {

    if (
      typeof onStateChange
      === 'function'
    ) {

      onStateChange(
        safeState
      )
    }

  }, [

    safeState,
    onStateChange,

  ])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Conversation State Flow'
  )

  console.log({

    status:
      safeState.status,

    messageCount:
      safeState.messages
        ?.length || 0,

    latestRole:
      derivedState
        ?.latestMessage
        ?.role,

    hasError:
      derivedState
        ?.hasError,

  })

  // ======================================
  // Flow Layer
  // ======================================

  return null
}