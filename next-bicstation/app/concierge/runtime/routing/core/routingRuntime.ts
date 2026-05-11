// /app/concierge/runtime/routing/core/routingRuntime.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../../contracts/semantic/SemanticIntent'

import type {
  NavigationState,
} from '../../../contracts/routing/NavigationState'

/* =========================================
🔥 DOMAIN
========================================= */

import RoutingDomain
  from '../../../domain/routing/routingDomain'

/* =========================================
🔥 TYPES
========================================= */

export type RoutingRuntimeResult = {

  state: NavigationState

  route?: {
    path: string
    type: string
  }

  metrics: {

    routeType?: string
    routePath?: string
  }
}

/* =========================================
🔥 Create Routing State
========================================= */

export function
createRoutingState(): NavigationState {

  return RoutingDomain
    .createInitialState()
}

/* =========================================
🔥 Resolve Routing
========================================= */

export function
executeRoutingRuntime({
  state,
  semanticIntent,
}: {
  state: NavigationState
  semanticIntent?: SemanticIntent
}): RoutingRuntimeResult {

  const route = RoutingDomain
    .resolveSemanticRoute(
      semanticIntent
    )

  const updatedState = {
    ...state,
    currentRoute: route,
  }

  const metrics = {
    routeType: route?.type,
    routePath: route?.path,
  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Routing Runtime'
  )

  console.log({
    usage: semanticIntent?.usage,
    metrics,
  })

  return {
    state: updatedState,
    route,
    metrics,
  }
}