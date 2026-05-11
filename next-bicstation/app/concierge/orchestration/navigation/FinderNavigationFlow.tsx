// /app/concierge/orchestration/navigation/FinderNavigationFlow.tsx

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
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import RoutingDomain
  from '@/app/concierge/domain/routing/routingDomain'

/* =========================================
🔥 Props
========================================= */

type Props = {

  semanticIntent?:
    SemanticIntent

  autoNavigate?: boolean
}

/* =========================================
🔥 Finder Navigation Flow
========================================= */

export default function
FinderNavigationFlow({
  semanticIntent,
  autoNavigate = false,
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
  // Is Finder Route
  // ======================================

  const isFinderRoute =

    useMemo(() => (

      RoutingDomain
        .isFinderRoute(
          route
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
      !isFinderRoute
    ) {

      return
    }

    if (
      !route?.path
    ) {

      return
    }

    console.log(
      '🔥 Finder Navigation'
    )

    console.log({

      usage:
        semanticIntent
          ?.usage,

      path:
        route.path,

    })

    router.push(
      route.path
    )

  }, [

    autoNavigate,
    isFinderRoute,
    route,
    router,
    semanticIntent,

  ])

  // ======================================
  // Render
  // ======================================

  return null
}