// /app/concierge/orchestration/memory/ConversationMemoryFlow.tsx

'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

/* =========================================
🔥 DOMAIN
========================================= */

import MemoryDomain
  from '@/app/concierge/domain/memory/memoryDomain'

/* =========================================
🔥 HELPERS
========================================= */

import {
  randomId,
} from '@/app/concierge/lib/core/helpers'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?:
    ConversationMessage[]

  sessionKey?: string

  onRestore?: (
    messages:
      ConversationMessage[]
  ) => void
}

/* =========================================
🔥 Conversation Memory Flow
========================================= */

export default function
ConversationMemoryFlow({
  messages = [],
  sessionKey = 'conversation-memory',
  onRestore,
}: Props) {

  // ======================================
  // Runtime State
  // ======================================

  const [
    restored,
    setRestored,
  ] = useState(false)

  // ======================================
  // Normalized Messages
  // ======================================

  const normalizedMessages =

    useMemo(() => (

      MemoryDomain
        .normalizeMessages(
          messages
        )

    ), [messages])

  // ======================================
  // Restore Memory
  // ======================================

  useEffect(() => {

    if (
      restored
    ) {

      return
    }

    try {

      const raw =

        localStorage.getItem(
          sessionKey
        )

      if (
        !raw
      ) {

        setRestored(true)
        return
      }

      const parsed =
        JSON.parse(raw)

      const restoredMessages =

        MemoryDomain
          .normalizeMessages(

            parsed
              ?.memory
              ?.messages

          )

      if (
        restoredMessages
          ?.length
      ) {

        onRestore?.(
          restoredMessages
        )
      }

    } catch (error) {

      console.error(
        '🔥 Conversation Memory Restore'
      )

      console.error(error)

    } finally {

      setRestored(true)
    }

  }, [

    restored,
    sessionKey,
    onRestore,

  ])

  // ======================================
  // Persist Memory
  // ======================================

  useEffect(() => {

    if (
      !restored
    ) {

      return
    }

    const payload = {

      id:
        randomId(),

      sessionKey,

      memory: {

        messages:
          normalizedMessages,

      },

      updated_at:
        new Date()
          .toISOString(),

    }

    try {

      localStorage.setItem(

        sessionKey,

        JSON.stringify(
          payload
        )

      )

    } catch (error) {

      console.error(
        '🔥 Conversation Memory Save'
      )

      console.error(error)
    }

  }, [

    restored,
    sessionKey,
    normalizedMessages,

  ])

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    restored,

    totalMessages:

      normalizedMessages
        ?.length || 0,

    latestMessage:

      normalizedMessages
        ?.slice(-1)?.[0]
        ?.role || null,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Conversation Memory Flow'
  )

  console.log(
    metrics
  )

  // ======================================
  // Render
  // ======================================

  return (

    <div
      style={{

        display:
          'none',

      }}
    >

      conversation_memory_ready

    </div>

  )
}