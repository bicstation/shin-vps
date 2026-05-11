// /app/concierge/orchestration/memory/SessionMemoryFlow.tsx

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

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 FLOWS
========================================= */

import ConversationMemoryFlow
  from './ConversationMemoryFlow'

import SemanticMemoryFlow
  from './SemanticMemoryFlow'

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

  semanticIntent?:
    SemanticIntent

  sessionKey?: string

  onConversationRestore?: (
    messages:
      ConversationMessage[]
  ) => void

  onSemanticRestore?: (
    semanticIntent:
      SemanticIntent
  ) => void
}

/* =========================================
🔥 Session Memory Flow
========================================= */

export default function
SessionMemoryFlow({
  messages = [],
  semanticIntent,
  sessionKey = 'concierge-session',
  onConversationRestore,
  onSemanticRestore,
}: Props) {

  // ======================================
  // Runtime State
  // ======================================

  const [
    sessionId,
  ] = useState(
    randomId()
  )

  const [
    ready,
    setReady,
  ] = useState(false)

  // ======================================
  // Session Metrics
  // ======================================

  const metrics =

    useMemo(() => ({

      sessionId,

      totalMessages:
        messages.length,

      usage:
        semanticIntent
          ?.usage || null,

      runtime:
        ready
          ? 'ready'
          : 'booting',

    }), [

      sessionId,
      messages,
      semanticIntent,
      ready,

    ])

  // ======================================
  // Runtime Boot
  // ======================================

  useEffect(() => {

    setReady(true)

  }, [])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Session Memory Flow'
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
          onConversationRestore
        }

      />

      {/* ==================================
      Semantic Memory
      ================================== */}

      <SemanticMemoryFlow

        sessionKey={
          `${sessionKey}-semantic`
        }

        semanticIntent={
          semanticIntent
        }

        onRestore={
          onSemanticRestore
        }

      />

    </>

  )
}