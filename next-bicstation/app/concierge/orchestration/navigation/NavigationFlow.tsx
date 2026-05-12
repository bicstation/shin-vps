// /app/concierge/orchestration/navigation/NavigationFlow.tsx

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

  onNavigate?: (
    path: string
  ) => void
}

/* =========================================
🔥 Navigation Flow
========================================= */

export default function
NavigationFlow({
  semanticIntent,
  autoNavigate = false,
  onNavigate,
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
  // Navigation State
  // ======================================

  const canNavigate =

    useMemo(() => (

      Boolean(
        route?.path
      )

    ), [route])

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
      '🔥 Navigation Flow'
    )

    console.log({

      usage:
        semanticIntent
          ?.usage,

      route,

    })

    onNavigate?.(
      route.path
    )

    router.push(
      route.path
    )

  }, [

    autoNavigate,
    canNavigate,
    route,
    router,
    semanticIntent,
    onNavigate,

  ])

  // ======================================
  // Render
  // ======================================

  return null
}