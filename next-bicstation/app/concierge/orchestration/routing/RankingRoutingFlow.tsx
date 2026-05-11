// /app/concierge/orchestration/routing/RankingRoutingFlow.tsx

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

  onRankingRoute?: (
    route: any
  ) => void
}

/* =========================================
🔥 Ranking Routing Flow
========================================= */

export default function
RankingRoutingFlow({
  semanticIntent,
  autoNavigate = false,
  onRankingRoute,
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
  // Ranking Route
  // ======================================

  const rankingRoute =

    useMemo(() => {

      if (
        RoutingDomain
          .isRankingRoute(
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
      rankingRoute
      &&
      onRankingRoute
    ) {

      onRankingRoute(
        rankingRoute
      )
    }

  }, [

    rankingRoute,
    onRankingRoute,

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
      !rankingRoute?.path
    ) {

      return
    }

    console.log(
      '🔥 Ranking Routing Flow'
    )

    console.log({

      usage:
        semanticIntent
          ?.usage,

      path:
        rankingRoute.path,

    })

    router.push(
      rankingRoute.path
    )

  }, [

    autoNavigate,
    rankingRoute,
    router,
    semanticIntent,

  ])

  // ======================================
  // Render
  // ======================================

  return null
}