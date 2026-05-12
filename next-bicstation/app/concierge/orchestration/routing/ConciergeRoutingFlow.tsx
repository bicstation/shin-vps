// /app/concierge/orchestration/routing/ConciergeRoutingFlow.tsx

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
} from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import RoutingDomain
  from '../../domain/routing/routingDomain'

/* =========================================
🔥 Props
========================================= */

type Props = {

  semanticIntent?:
    SemanticIntent

  autoNavigate?: boolean

  onRouteResolved?: (
    route: any
  ) => void
}

/* =========================================
🔥 Concierge Routing Flow
========================================= */

export default function
ConciergeRoutingFlow({
  semanticIntent,
  autoNavigate = false,
  onRouteResolved,
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
  // Route State
  // ======================================

  const canNavigate =

    useMemo(() => (

      Boolean(
        route?.path
      )

    ), [route])

  // ======================================
  // Route Callback
  // ======================================

  useEffect(() => {

    if (
      route
      &&
      onRouteResolved
    ) {

      onRouteResolved(
        route
      )
    }

  }, [

    route,
    onRouteResolved,

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
      !canNavigate
    ) {

      return
    }

    console.log(
      '🔥 Concierge Routing Flow'
    )

    console.log({

      usage:
        semanticIntent
          ?.usage,

      route,

    })

    router.push(
      route.path
    )

  }, [

    autoNavigate,
    canNavigate,
    route,
    router,
    semanticIntent,

  ])

  // ======================================
  // Render
  // ======================================

  return null
}