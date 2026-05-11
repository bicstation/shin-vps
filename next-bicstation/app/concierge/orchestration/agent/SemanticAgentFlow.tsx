// /app/concierge/orchestration/agent/SemanticAgentFlow.tsx
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
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 AGENTS
========================================= */

import GamingAgent
  from '@/app/concierge/agents/specialists/GamingAgent'

import CreatorAgent
  from '@/app/concierge/agents/specialists/CreatorAgent'

import BusinessAgent
  from '@/app/concierge/agents/specialists/BusinessAgent'

import AIAgent
  from '@/app/concierge/agents/specialists/AIAgent'

/* =========================================
🔥 SEMANTIC
========================================= */

import {
  resolveSemanticIntent,
} from '@/app/concierge/semantic/intent/resolveSemanticIntent'

/* =========================================
🔥 SECTION
========================================= */

import SemanticSection
  from '@/app/concierge/sections/semantic/SemanticSection'

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
        semanticIntent?.usage
      ) {

        case 'gaming':
          return GamingAgent

        case 'creator':
          return CreatorAgent

        case 'business':
          return BusinessAgent

        case 'ai':
          return AIAgent

        default:
          return null
      }

    }, [semanticIntent])

  // ======================================
  // Semantic Runtime
  // ======================================

  const runtimeSemantic =

    useMemo(() => {

      if (
        !specialistAgent
      ) {

        return semanticIntent
      }

      try {

        if (
          typeof specialistAgent
            ?.resolveSemantic
          !== 'function'
        ) {

          return semanticIntent
        }

        return specialistAgent
          .resolveSemantic({

            intent:
              semanticIntent,

            messages,

          })

      } catch (error) {

        console.error(
          '🔥 Semantic Agent Error'
        )

        console.error(error)

        return semanticIntent
      }

    }, [

      specialistAgent,
      semanticIntent,
      messages,

    ])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Agent Flow'
  )

  console.log({

    usage:
      runtimeSemantic?.usage,

    gpu:
      runtimeSemantic?.gpu,

    budget:
      runtimeSemantic?.budget,

    specialist:

      specialistAgent?.name
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