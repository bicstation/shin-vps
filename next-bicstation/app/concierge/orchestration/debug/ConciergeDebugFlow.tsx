// /app/concierge/orchestration/debug/ConciergeDebugFlow.tsx

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
🔥 KERNEL
========================================= */

import RuntimeKernel
  from '../kernel/runtime/RuntimeKernel'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from '../styles/debug.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  enabled?: boolean

  messages?:
    ConversationMessage[]

  recommendations?:
    RecommendationPayload[]
}

/* =========================================
🔥 Concierge Debug Flow
========================================= */

export default function
ConciergeDebugFlow({
  enabled = false,
  messages = [],
  recommendations = [],
}: Props) {

  // ======================================
  // Runtime
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
  // Disabled
  // ======================================

  if (
    !enabled
  ) {

    return null
  }

  // ======================================
  // Runtime Values
  // ======================================

  const semanticIntent =

    runtime?.semanticIntent

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
    '🔥 Concierge Debug Flow'
  )

  console.log({

    semanticIntent,

    route,

    metrics,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.debug
      }
    >

      {/* ==================================
      Header
      ================================== */}

      <div
        className={
          styles.debugHeader
        }
      >

        🔥 Runtime Debug

      </div>

      {/* ==================================
      Semantic
      ================================== */}

      <div
        className={
          styles.debugBlock
        }
      >

        <h3>
          Semantic Intent
        </h3>

        <pre>
          {JSON.stringify(

            semanticIntent,

            null,
            2

          )}
        </pre>

      </div>

      {/* ==================================
      Route
      ================================== */}

      <div
        className={
          styles.debugBlock
        }
      >

        <h3>
          Route
        </h3>

        <pre>
          {JSON.stringify(

            route,

            null,
            2

          )}
        </pre>

      </div>

      {/* ==================================
      Metrics
      ================================== */}

      <div
        className={
          styles.debugBlock
        }
      >

        <h3>
          Metrics
        </h3>

        <pre>
          {JSON.stringify(

            metrics,

            null,
            2

          )}
        </pre>

      </div>

      {/* ==================================
      Graph
      ================================== */}

      <div
        className={
          styles.debugBlock
        }
      >

        <h3>
          Graph
        </h3>

        <pre>
          {JSON.stringify(

            graph,

            null,
            2

          )}
        </pre>

      </div>

    </section>
  )
}