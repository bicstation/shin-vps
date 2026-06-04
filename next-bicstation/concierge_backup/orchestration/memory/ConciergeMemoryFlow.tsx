// /app/concierge/orchestration/memory/ConciergeMemoryFlow.tsx

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
} from '../../contracts/conversation/ConversationMessage'

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import MemoryDomain
  from '../../domain/memory/memoryDomain'

/* =========================================
🔥 HELPERS
========================================= */

import {
  randomId,
} from '../../lib/core/helpers'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?:
    ConversationMessage[]

  semanticIntent?:
    SemanticIntent

  sessionKey?: string

  onMemoryUpdate?: (
    memory: any
  ) => void
}

/* =========================================
🔥 Concierge Memory Flow
========================================= */

export default function
ConciergeMemoryFlow({
  messages = [],
  semanticIntent,
  sessionKey = 'concierge-session',
  onMemoryUpdate,
}: Props) {

  // ======================================
  // Memory State
  // ======================================

  const [
    memory,
    setMemory,
  ] = useState(() => (

    MemoryDomain
      .createMemory()

  ))

  // ======================================
  // Conversation Context
  // ======================================

  const context =

    useMemo(() => (

      MemoryDomain
        .buildConversationContext(
          messages
        )

    ), [messages])

  // ======================================
  // Sync Memory
  // ======================================

  useEffect(() => {

    let nextMemory = {

      ...memory,

      messages:
        MemoryDomain
          .normalizeMessages(
            messages
          ),

    }

    // ===================================
    // Semantic Intent
    // ===================================

    if (
      semanticIntent
    ) {

      nextMemory =

        MemoryDomain
          .saveSemanticIntent({

            memory:
              nextMemory,

            semanticIntent,

          })
    }

    // ===================================
    // Session
    // ===================================

    const payload = {

      id:
        randomId(),

      sessionKey,

      context,

      memory:
        nextMemory,

      updated_at:
        new Date()
          .toISOString(),

    }

    // ===================================
    // LocalStorage
    // ===================================

    try {

      localStorage.setItem(

        sessionKey,

        JSON.stringify(
          payload
        )

      )

    } catch (error) {

      console.error(
        '🔥 Concierge Memory Save'
      )

      console.error(error)
    }

    // ===================================
    // Update
    // ===================================

    setMemory(
      nextMemory
    )

    onMemoryUpdate?.(
      payload
    )

  }, [

    messages,
    semanticIntent,
    sessionKey,
    context,
    memory,
    onMemoryUpdate,

  ])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Concierge Memory Flow'
  )

  console.log({

    sessionKey,

    messages:
      memory?.messages
        ?.length || 0,

    usage:
      memory
        ?.semanticIntent
        ?.usage,

    context,

  })

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

      memory_runtime_ready

    </div>

  )
}