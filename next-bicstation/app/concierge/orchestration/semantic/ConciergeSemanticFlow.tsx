// /app/concierge/orchestration/semantic/ConciergeSemanticFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticDomain
  from '../domain/semantic/semanticDomain'

/* =========================================
🔥 GRAPH
========================================= */

import SemanticGraph
  from '../graph/SemanticGraph'

/* =========================================
🔥 COMPONENTS
========================================= */

import SemanticBadge
  from '../components/SemanticBadge'

/* =========================================
🔥 Props
========================================= */

type Props = {

  semanticIntent?:
    SemanticIntent
}

/* =========================================
🔥 Concierge Semantic Flow
========================================= */

export default function
ConciergeSemanticFlow({
  semanticIntent,
}: Props) {

  // ======================================
  // Semantic Summary
  // ======================================

  const summary =

    useMemo(() => (

      SemanticDomain
        .buildSemanticSummary(
          semanticIntent
        )

    ), [semanticIntent])

  // ======================================
  // Semantic Graph
  // ======================================

  const graph =

    useMemo(() => (

      SemanticGraph.build({

        semanticIntent,

        recommendations: [],

      })

    ), [semanticIntent])

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    usage:
      semanticIntent
        ?.usage || null,

    graphNodes:
      graph?.nodes
        ?.length || 0,

    graphEdges:
      graph?.edges
        ?.length || 0,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Concierge Semantic Flow'
  )

  console.log({

    summary,

    metrics,

  })

  // ======================================
  // Empty
  // ======================================

  if (
    !semanticIntent
  ) {

    return null
  }

  // ======================================
  // Render
  // ======================================

  return (

    <SemanticBadge

      semanticIntent={
        semanticIntent
      }

      summary={
        summary
      }

    />

  )
}