// /app/concierge/orchestration/runtime/RuntimeFlow.tsx

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

import RuntimeKernel
  from '@/app/concierge/kernel/runtime/RuntimeKernel'

/* =========================================
🔥 FLOWS
========================================= */

import RuntimeCoordinator
  from '@/app/concierge/orchestration/core/RuntimeCoordinator'

import RoutingRuntimeFlow
  from '@/app/concierge/orchestration/routing/RoutingRuntimeFlow'

import RecommendationRuntimeFlow
  from '@/app/concierge/orchestration/recommendation/RecommendationRuntimeFlow'

import MemoryRuntimeFlow
  from '@/app/concierge/orchestration/memory/MemoryRuntimeFlow'

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
🔥 Runtime Flow
========================================= */

export default function
RuntimeFlow({
  messages = [],
  recommendations = [],
  autoNavigate = false,
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

  const metrics =
    runtime?.metrics

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Runtime Flow'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    recommendations:

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
      Runtime Coordinator
      ================================== */}

      <RuntimeCoordinator

        messages={
          messages
        }

        recommendations={
          runtimeRecommendations
        }

      />

      {/* ==================================
      Recommendation Runtime
      ================================== */}

      <RecommendationRuntimeFlow

        recommendations={
          runtimeRecommendations
        }

        semanticIntent={
          semanticIntent
        }

      />

      {/* ==================================
      Routing Runtime
      ================================== */}

      <RoutingRuntimeFlow

        semanticIntent={
          semanticIntent
        }

        recommendations={
          runtimeRecommendations
        }

        autoNavigate={
          autoNavigate
        }

      />

      {/* ==================================
      Memory Runtime
      ================================== */}

      <MemoryRuntimeFlow

        messages={
          messages
        }

        semanticIntent={
          semanticIntent
        }

      />

    </>

  )
}