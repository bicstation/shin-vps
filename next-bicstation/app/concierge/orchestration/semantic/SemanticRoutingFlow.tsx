// /app/concierge/orchestration/semantic/SemanticRoutingFlow.tsx

'use client'

import {
  useEffect,
  useMemo,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import RoutingDomain
  from '../domain/routing/routingDomain'

/* =========================================
🔥 GRAPH
========================================= */

import SemanticGraph
  from '../graph/SemanticGraph'

/* =========================================
🔥 Props
========================================= */

type Props = {

  semanticIntent?:
    SemanticIntent

  autoNavigate?: boolean

  onResolved?: (
    route: any
  ) => void
}

/* =========================================
🔥 Semantic Routing Flow
========================================= */

export default function
SemanticRoutingFlow({
  semanticIntent,
  autoNavigate = false,
  onResolved,
}: Props) {

  const router =
    useRouter()

  // ======================================
  // Resolve Route
  // ======================================

  const route =

    useMemo(() => (

      RoutingDomain
        .resolveSemanticRoute(
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

    routeType:
      route?.type || null,

    routePath:
      route?.path || null,

    graphNodes:
      graph?.nodes
        ?.length || 0,

    graphEdges:
      graph?.edges
        ?.length || 0,

  }

  // ======================================
  // Route Callback
  // ======================================

  useEffect(() => {

    if (
      route
      &&
      onResolved
    ) {

      onResolved(
        route
      )
    }

  }, [

    route,
    onResolved,

  ])

  // ======================================
  // Auto Navigation
  // ======================================

  useEffect(() => {

    if (
      !autoNavigate
    ) {

      return
    }

    if (
      !route?.path
    ) {

      return
    }

    console.log(
      '🔥 Semantic Routing Flow'
    )

    console.log(
      metrics
    )

    router.push(
      route.path
    )

  }, [

    autoNavigate,
    route,
    router,
    metrics,

  ])

  // ======================================
  // Render
  // ======================================

  return null
}