// /app/concierge/orchestration/core/ConciergeOrchestrator.tsx

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
  RecommendationPayload,
} from '../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 KERNELS
========================================= */

import RuntimeKernel
  from '../kernel/runtime/RuntimeKernel'

/* =========================================
🔥 FLOWS
========================================= */

import ConciergeConversationFlow
  from '../orchestration/conversation/ConciergeConversationFlow'

import ConciergeSemanticFlow
  from '../orchestration/semantic/ConciergeSemanticFlow'

import ConciergeRecommendationFlow
  from '../orchestration/recommendation/ConciergeRecommendationFlow'

import ConciergeConversionFlow
  from '../orchestration/conversion/ConciergeConversionFlow'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?:
    ConversationMessage[]

  recommendations?:
    RecommendationPayload[]
}

/* =========================================
🔥 Concierge Orchestrator
========================================= */

export default function
ConciergeOrchestrator({
  messages = [],
  recommendations = [],
}: Props) {

  // ======================================
  // Runtime Execution
  // ======================================

  const runtime =

    useMemo(() => (

      RuntimeKernel.execute({

        state: {

          status:
            'success',

          messages,

          error:
            null,

        },

        recommendations,

      })

    ), [

      messages,
      recommendations,

    ])

  // ======================================
  // Runtime Values
  // ======================================

  const semanticIntent =

    runtime?.semanticIntent

  const runtimeRecommendations =

    runtime?.recommendations
    || []

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Concierge Orchestrator'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    recommendations:
      runtimeRecommendations
        ?.length || 0,

    route:
      runtime?.route,

    metrics:
      runtime?.metrics,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <>

      {/* ==================================
      SEMANTIC FLOW
      ================================== */}

      <ConciergeSemanticFlow

        semanticIntent={
          semanticIntent
        }

      />

      {/* ==================================
      CONVERSATION FLOW
      ================================== */}

      <ConciergeConversationFlow

        messages={
          messages
        }

      />

      {/* ==================================
      RECOMMENDATION FLOW
      ================================== */}

      <ConciergeRecommendationFlow

        recommendations={
          runtimeRecommendations
        }

        semanticIntent={
          semanticIntent
        }

      />

      {/* ==================================
      CONVERSION FLOW
      ================================== */}

      <ConciergeConversionFlow

        recommendations={
          runtimeRecommendations
        }

        semanticIntent={
          semanticIntent
        }

      />

    </>

  )
}