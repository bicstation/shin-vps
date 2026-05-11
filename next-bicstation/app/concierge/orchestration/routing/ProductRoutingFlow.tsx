// /app/concierge/orchestration/routing/ProductRoutingFlow.tsx

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
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 DOMAIN
========================================= */

import RoutingDomain
  from '@/app/concierge/domain/routing/routingDomain'

/* =========================================
🔥 Props
========================================= */

type Props = {

  recommendation?:
    RecommendationPayload

  autoNavigate?: boolean

  onRouteResolved?: (
    route: any
  ) => void
}

/* =========================================
🔥 Product Routing Flow
========================================= */

export default function
ProductRoutingFlow({
  recommendation,
  autoNavigate = false,
  onRouteResolved,
}: Props) {

  const router =
    useRouter()

  // ======================================
  // Resolve Product Route
  // ======================================

  const route =

    useMemo(() => {

      if (
        !recommendation
      ) {

        return null
      }

      return RoutingDomain
        .resolveProductRoute(
          recommendation
        )

    }, [recommendation])

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
      !route?.path
    ) {

      return
    }

    console.log(
      '🔥 Product Routing Flow'
    )

    console.log({

      product:
        recommendation
          ?.name,

      path:
        route.path,

    })

    router.push(
      route.path
    )

  }, [

    autoNavigate,
    route,
    router,
    recommendation,

  ])

  // ======================================
  // Render
  // ======================================

  return null
}