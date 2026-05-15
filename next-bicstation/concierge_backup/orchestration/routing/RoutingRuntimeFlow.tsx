// /app/concierge/orchestration/routing/RoutingRuntimeFlow.tsx

'use client'

import {
  useMemo,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

import type {
  RecommendationPayload,
} from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 DOMAIN
========================================= */

import RoutingDomain
  from '../../domain/routing/routingDomain'

/* =========================================
🔥 FLOWS
========================================= */

import ConciergeRoutingFlow
  from './ConciergeRoutingFlow'

import FinderRoutingFlow
  from './FinderRoutingFlow'

import RankingRoutingFlow
  from './RankingRoutingFlow'

import ProductRoutingFlow
  from './ProductRoutingFlow'

/* =========================================
🔥 Props
========================================= */

type Props = {

  semanticIntent?:
    SemanticIntent

  recommendations?:
    RecommendationPayload[]

  autoNavigate?: boolean
}

/* =========================================
🔥 Routing Runtime Flow
========================================= */

export default function
RoutingRuntimeFlow({
  semanticIntent,
  recommendations = [],
  autoNavigate = false,
}: Props) {

  // ======================================
  // Resolve Runtime Route
  // ======================================

  const route =

    useMemo(() => (

      RoutingDomain
        .resolveSemanticRoute(
          semanticIntent
        )

    ), [semanticIntent])

  // ======================================
  // Top Recommendation
  // ======================================

  const topRecommendation =

    useMemo(() => (

      recommendations?.[0]

    ), [recommendations])

  // ======================================
  // Route Metrics
  // ======================================

  const metrics = {

    usage:
      semanticIntent
        ?.usage || null,

    routeType:
      route?.type || null,

    routePath:
      route?.path || null,

    recommendations:
      recommendations
        ?.length || 0,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Routing Runtime Flow'
  )

  console.log(
    metrics
  )

  // ======================================
  // Render
  // ======================================

  return (

    <>

      {/* ==================================
      Core Routing
      ================================== */}

      <ConciergeRoutingFlow

        semanticIntent={
          semanticIntent
        }

        autoNavigate={
          autoNavigate
        }

      />

      {/* ==================================
      Finder Routing
      ================================== */}

      <FinderRoutingFlow

        semanticIntent={
          semanticIntent
        }

        autoNavigate={
          false
        }

      />

      {/* ==================================
      Ranking Routing
      ================================== */}

      <RankingRoutingFlow

        semanticIntent={
          semanticIntent
        }

        autoNavigate={
          false
        }

      />

      {/* ==================================
      Product Routing
      ================================== */}

      <ProductRoutingFlow

        recommendation={
          topRecommendation
        }

        autoNavigate={
          false
        }

      />

    </>

  )
}