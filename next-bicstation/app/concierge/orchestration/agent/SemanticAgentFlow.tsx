// /app/concierge/orchestration/agent/SemanticAgentFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 AGENTS
========================================= */

import type {
  GamingAgent,
} from '../../agents/specialists/GamingAgent'

import type {
  CreatorAgent,
} from '../../agents/specialists/CreatorAgent'

import type {
  BusinessAgent,
} from '../../agents/specialists/BusinessAgent'

import type {
  AIAgent,
} from '../../agents/specialists/AIAgent'

/* =========================================
🔥 SEMANTIC
========================================= */

import {
  resolveSemanticIntent,
} from '../../semantic/intent/resolveSemanticIntent'

/* =========================================
🔥 SECTION
========================================= */

import SemanticSection
  from '../../sections/semantic/SemanticSection'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?: any[]
}

/* =========================================
🔥 Semantic Agent Flow
========================================= */

export default function
SemanticAgentFlow({
  messages = [],
}: Props) {

  // ======================================
  // Semantic Intent
  // ======================================

  const semanticIntent =

    useMemo<
      SemanticIntent
    >(() => (

      resolveSemanticIntent(
        messages
      )

    ), [messages])

  // ======================================
  // Specialist Agent
  // ======================================

  const specialistAgent =

    useMemo(() => {

      switch (
        semanticIntent?.value
      ) {

        case 'gaming':
          return 'gaming'

        case 'creator':
          return 'creator'

        case 'business':
          return 'business'

        case 'ai':
          return 'ai'

        default:
          return null
      }

    }, [semanticIntent])

  // ======================================
  // Runtime Semantic
  // ======================================

  const runtimeSemantic =

    useMemo(() => {

      return semanticIntent

    }, [semanticIntent])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Agent Flow'
  )

  console.log({

    type:
      runtimeSemantic?.type,

    value:
      runtimeSemantic?.value,

    specialist:
      specialistAgent
      || 'none',

  })

  // ======================================
  // Render
  // ======================================

  return (

    <SemanticSection

      semanticIntent={
        runtimeSemantic
      }

    />

  )
}