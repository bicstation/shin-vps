// /app/concierge/orchestration/debug/SemanticDebugFlow.tsx

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

/* =========================================
🔥 KERNEL
========================================= */

import SemanticKernel
  from '@/app/concierge/kernel/semantic/SemanticKernel'

/* =========================================
🔥 GRAPH
========================================= */

import SemanticGraph
  from '@/app/concierge/graph/SemanticGraph'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from '@/app/concierge/styles/debug.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  enabled?: boolean

  messages?:
    ConversationMessage[]
}

/* =========================================
🔥 Semantic Debug Flow
========================================= */

export default function
SemanticDebugFlow({
  enabled = false,
  messages = [],
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

  const summary =
    runtime?.summary

  const route =
    runtime?.route

  const graph =
    runtime?.graph

  const metrics =
    runtime?.metrics

  // ======================================
  // Connected Products
  // ======================================

  const connectedProducts =

    useMemo(() => (

      SemanticGraph
        .resolveConnectedProducts({

          semanticIntent,

          recommendations: [],

        })

    ), [semanticIntent])

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Debug Flow'
  )

  console.log({

    semanticIntent,

    summary,

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

        🧠 Semantic Debug

      </div>

      {/* ==================================
      Semantic Intent
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
      Summary
      ================================== */}

      <div
        className={
          styles.debugBlock
        }
      >

        <h3>
          Summary
        </h3>

        <pre>
          {summary}
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
      Connected Products
      ================================== */}

      <div
        className={
          styles.debugBlock
        }
      >

        <h3>
          Connected Products
        </h3>

        <pre>
          {JSON.stringify(

            connectedProducts,

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