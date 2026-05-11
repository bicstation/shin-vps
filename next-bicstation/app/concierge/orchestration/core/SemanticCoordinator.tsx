// /app/concierge/orchestration/core/SemanticCoordinator.tsx

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

/* =========================================
🔥 KERNELS
========================================= */

import SemanticKernel
  from '../kernel/semantic/SemanticKernel'

/* =========================================
🔥 FLOWS
========================================= */

import ConciergeSemanticFlow
  from '../orchestration/semantic/ConciergeSemanticFlow'

/* =========================================
🔥 GRAPH
========================================= */

import SemanticGraph
  from '../graph/SemanticGraph'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?:
    ConversationMessage[]
}

/* =========================================
🔥 Semantic Coordinator
========================================= */

export default function
SemanticCoordinator({
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
  // Connected Nodes
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
    '🔥 Semantic Coordinator'
  )

  console.log({

    usage:
      semanticIntent?.usage,

    summary,

    route,

    connectedProducts:
      connectedProducts
        ?.length || 0,

    graphNodes:
      graph?.nodes
        ?.length || 0,

    graphEdges:
      graph?.edges
        ?.length || 0,

    metrics,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <ConciergeSemanticFlow

      semanticIntent={
        semanticIntent
      }

    />

  )
}