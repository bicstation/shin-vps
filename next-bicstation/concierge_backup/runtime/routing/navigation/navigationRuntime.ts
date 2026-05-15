// /app/concierge/runtime/routing/navigation/navigationRuntime.ts

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

export type NavigationRuntimeResult = {

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
🔥 Create Navigation State
========================================= */

export function
createNavigationState(): NavigationState {

  return RoutingDomain
    .createInitialState()
}

/* =========================================
🔥 Execute Navigation Runtime
========================================= */

export function
executeNavigationRuntime({
  state,
  semanticIntent,
}: {
  state: NavigationState
  semanticIntent?: SemanticIntent
}): NavigationRuntimeResult {

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
    '🔥 Navigation Runtime'
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