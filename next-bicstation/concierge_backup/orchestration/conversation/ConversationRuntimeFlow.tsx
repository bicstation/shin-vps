// /app/concierge/orchestration/conversation/ConversationRuntimeFlow.tsx

'use client'

import {
  useMemo,
  useState,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../contracts/conversation/ConversationMessage'

import type {
  ConversationState,
} from '../../contracts/conversation/ConversationState'

/* =========================================
🔥 FLOWS
========================================= */

import ConversationMessageFlow
  from './ConversationMessageFlow'

import ConversationIntentFlow
  from './ConversationIntentFlow'

/* =========================================
🔥 SECTIONS
========================================= */

import InputSection
  from '../../sections/input/InputSection'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?: ConversationMessage[]
}

/* =========================================
🔥 Conversation Runtime Flow
========================================= */

export default function
ConversationRuntimeFlow({
  messages = [],
}: Props) {

  // ======================================
  // Runtime State
  // ======================================

  const [
    runtimeState,
    setRuntimeState,
  ] = useState<
    ConversationState
  >({

    status:
      'idle',

    messages,

  })

  // ======================================
  // Safe Messages
  // ======================================

  const safeMessages =

    useMemo(() => (

      Array.isArray(
        runtimeState?.messages
      )
        ? runtimeState.messages
        : []

    ), [runtimeState])

  // ======================================
  // Runtime Stats
  // ======================================

  const runtimeStats =

    useMemo(() => {

      const userCount =

        safeMessages.filter(
          item => (
            item?.role
            === 'user'
          )
        ).length

      const assistantCount =

        safeMessages.filter(
          item => (
            item?.role
            === 'assistant'
          )
        ).length

      return {

        total:
          safeMessages.length,

        user:
          userCount,

        assistant:
          assistantCount,

      }

    }, [safeMessages])

  // ======================================
  // Input Submit
  // ======================================

  async function
  handleSubmit(
    content: string
  ) {

    if (
      !content?.trim()
    ) {

      return
    }

    try {

      setRuntimeState(
        prev => ({

          ...prev,

          status:
            'processing',

          messages: [

            ...(prev?.messages || []),

            {

              id:
                crypto.randomUUID(),

              role:
                'user',

              content,

              created_at:
                new Date()
                  .toISOString(),

            },

          ],

        })
      )

    } catch (error) {

      console.error(
        '🔥 Conversation Runtime Error'
      )

      console.error(error)

      setRuntimeState(
        prev => ({

          ...prev,

          status:
            'error',

        })
      )
    }
  }

  // ======================================
  // Intent Resolved
  // ======================================

  function handleIntentResolved(
    intent: any
  ) {

    console.log(
      '🔥 Runtime Intent'
    )

    console.log(intent)
  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Conversation Runtime Flow'
  )

  console.log({

    status:
      runtimeState?.status,

    stats:
      runtimeStats,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <>

      {/* ==================================
      MESSAGE FLOW
      ================================== */}

      <ConversationMessageFlow

        messages={
          safeMessages
        }

      />

      {/* ==================================
      INTENT FLOW
      ================================== */}

      <ConversationIntentFlow

        messages={
          safeMessages
        }

        onResolved={
          handleIntentResolved
        }

      />

      {/* ==================================
      INPUT
      ================================== */}

      <InputSection

        onSubmit={
          handleSubmit
        }

        disabled={
          runtimeState?.status
          === 'processing'
        }

      />

    </>

  )
}