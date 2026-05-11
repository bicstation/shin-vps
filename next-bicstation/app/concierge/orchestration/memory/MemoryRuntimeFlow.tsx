// /app/concierge/orchestration/memory/MemoryRuntimeFlow.tsx

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
} from '../contracts/conversation/ConversationMessage'

import type {
  SemanticIntent,
} from '../contracts/semantic/SemanticIntent'

/* =========================================
🔥 FLOWS
========================================= */

import ConciergeMemoryFlow
  from './ConciergeMemoryFlow'

import ConversationMemoryFlow
  from './ConversationMemoryFlow'

/* =========================================
🔥 DOMAIN
========================================= */

import MemoryDomain
  from '../domain/memory/memoryDomain'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?:
    ConversationMessage[]

  semanticIntent?:
    SemanticIntent

  sessionKey?: string

  onRestore?: (
    messages:
      ConversationMessage[]
  ) => void

  onMemoryUpdate?: (
    memory: any
  ) => void
}

/* =========================================
🔥 Memory Runtime Flow
========================================= */

export default function
MemoryRuntimeFlow({
  messages = [],
  semanticIntent,
  sessionKey = 'concierge-runtime',
  onRestore,
  onMemoryUpdate,
}: Props) {

  // ======================================
  // Runtime State
  // ======================================

  const [
    ready,
    setReady,
  ] = useState(false)

  // ======================================
  // Context
  // ======================================

  const context =

    useMemo(() => (

      MemoryDomain
        .buildConversationContext(
          messages
        )

    ), [messages])

  // ======================================
  // Runtime Boot
  // ======================================

  useEffect(() => {

    setReady(true)

  }, [])

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    ready,

    totalMessages:
      messages.length,

    usage:
      semanticIntent
        ?.usage || null,

    latestRole:
      context
        ?.latestMessage
        ?.role || null,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Memory Runtime Flow'
  )

  console.log(
    metrics
  )

  // ======================================
  // Not Ready
  // ======================================

  if (
    !ready
  ) {

    return null
  }

  // ======================================
  // Render
  // ======================================

  return (

    <>

      {/* ==================================
      Conversation Memory
      ================================== */}

      <ConversationMemoryFlow

        sessionKey={
          `${sessionKey}-conversation`
        }

        messages={
          messages
        }

        onRestore={
          onRestore
        }

      />

      {/* ==================================
      Concierge Memory
      ================================== */}

      <ConciergeMemoryFlow

        sessionKey={
          `${sessionKey}-semantic`
        }

        messages={
          messages
        }

        semanticIntent={
          semanticIntent
        }

        onMemoryUpdate={
          onMemoryUpdate
        }

      />

    </>

  )
}