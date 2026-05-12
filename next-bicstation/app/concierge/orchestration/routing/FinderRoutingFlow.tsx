// /app/concierge/orchestration/routing/FinderRoutingFlow.tsx

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

  onFinderRoute?: (
    route: any
  ) => void
}

/* =========================================
🔥 Finder Routing Flow
========================================= */

export default function
FinderRoutingFlow({
  semanticIntent,
  autoNavigate = false,
  onFinderRoute,
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
  // Finder Route
  // ======================================

  const finderRoute =

    useMemo(() => {

      if (
        RoutingDomain
          .isFinderRoute(
            route
          )
      ) {

        return route
      }

      return null

    }, [route])

  // ======================================
  // Route Callback
  // ======================================

  useEffect(() => {

    if (
      finderRoute
      &&
      onFinderRoute
    ) {

      onFinderRoute(
        finderRoute
      )
    }

  }, [

    finderRoute,
    onFinderRoute,

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
      !finderRoute?.path
    ) {

      return
    }

    console.log(
      '🔥 Finder Routing Flow'
    )

    console.log({

      usage:
        semanticIntent
          ?.usage,

      path:
        finderRoute.path,

    })

    router.push(
      finderRoute.path
    )

  }, [

    autoNavigate,
    finderRoute,
    router,
    semanticIntent,

  ])

  // ======================================
  // Render
  // ======================================

  return null
}