// /app/concierge/orchestration/semantic/SemanticRuntimeFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 KERNEL
========================================= */

import SemanticKernel
  from '@/app/concierge/kernel/semantic/SemanticKernel'

/* =========================================
🔥 FLOWS
========================================= */

import ConciergeSemanticFlow
  from './ConciergeSemanticFlow'

import SemanticExtractionFlow
  from './SemanticExtractionFlow'

import SemanticReasoningFlow
  from './SemanticReasoningFlow'

import SemanticRoutingFlow
  from './SemanticRoutingFlow'

/* =========================================
🔥 MEMORY
========================================= */

import SemanticMemoryFlow
  from '@/app/concierge/orchestration/memory/SemanticMemoryFlow'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?:
    ConversationMessage[]

  recommendations?:
    RecommendationPayload[]

  autoNavigate?: boolean
}

/* =========================================
🔥 Semantic Runtime Flow
========================================= */

export default function
SemanticRuntimeFlow({
  messages = [],
  recommendations = [],
  autoNavigate = false,
}: Props) {

  // ======================================
  // Semantic Runtime
  // ======================================

  const runtime =

    useMemo(() => (

      SemanticKernel.execute({

        messages,

      })

    ), [messages])

  // ======================================
  // Runtime Values
  // ======================================

  const semanticIntent =

    runtime?.semanticIntent

  const summary =
    runtime?.summary

  const metrics =
    runtime?.metrics

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Runtime Flow'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    summary,

    metrics,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <>

      {/* ==================================
      Semantic Extraction
      ================================== */}

      <SemanticExtractionFlow

        messages={
          messages
        }

      />

      {/* ==================================
      Semantic Badge
      ================================== */}

      <ConciergeSemanticFlow

        semanticIntent={
          semanticIntent
        }

      />

      {/* ==================================
      Semantic Reasoning
      ================================== */}

      <SemanticReasoningFlow

        semanticIntent={
          semanticIntent
        }

        recommendations={
          recommendations
        }

      />

      {/* ==================================
      Semantic Routing
      ================================== */}

      <SemanticRoutingFlow

        semanticIntent={
          semanticIntent
        }

        autoNavigate={
          autoNavigate
        }

      />

      {/* ==================================
      Semantic Memory
      ================================== */}

      <SemanticMemoryFlow

        semanticIntent={
          semanticIntent
        }

      />

    </>

  )
}