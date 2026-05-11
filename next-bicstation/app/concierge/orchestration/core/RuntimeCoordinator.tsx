// /app/concierge/orchestration/core/RuntimeCoordinator.tsx

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
🔥 KERNELS
========================================= */

import RuntimeKernel
  from '@/app/concierge/kernel/runtime/RuntimeKernel'

/* =========================================
🔥 COORDINATORS
========================================= */

import RecommendationCoordinator
  from './RecommendationCoordinator'

/* =========================================
🔥 FLOWS
========================================= */

import ConciergeConversationFlow
  from '@/app/concierge/orchestration/conversation/ConciergeConversationFlow'

import ConciergeSemanticFlow
  from '@/app/concierge/orchestration/semantic/ConciergeSemanticFlow'

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
🔥 Runtime Coordinator
========================================= */

export default function
RuntimeCoordinator({
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

  const route =
    runtime?.route

  const graph =
    runtime?.graph

  const metrics =
    runtime?.metrics

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Runtime Coordinator'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    route,

    graphNodes:
      graph?.nodes
        ?.length || 0,

    graphEdges:
      graph?.edges
        ?.length || 0,

    recommendationCount:

      runtimeRecommendations
        ?.length || 0,

    metrics,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <>

      {/* ==================================
      SEMANTIC
      ================================== */}

      <ConciergeSemanticFlow

        semanticIntent={
          semanticIntent
        }

      />

      {/* ==================================
      CONVERSATION
      ================================== */}

      <ConciergeConversationFlow

        messages={
          messages
        }

      />

      {/* ==================================
      RECOMMENDATION
      ================================== */}

      <RecommendationCoordinator

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