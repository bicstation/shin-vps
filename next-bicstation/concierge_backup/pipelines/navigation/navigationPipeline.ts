// /app/concierge/pipelines/navigation/navigationPipeline.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

import type {
  NavigationState,
} from '../../contracts/routing/NavigationState'

/* =========================================
🔥 DOMAIN
========================================= */

import RoutingDomain
  from '../../domain/routing/routingDomain'

/* =========================================
🔥 PIPELINE RESULT
========================================= */

export type NavigationPipelineResult = {

  state:
    NavigationState

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
🔥 Create Navigation Pipeline State
========================================= */

export function
createNavigationPipelineState():
NavigationState {

  return RoutingDomain
    .createInitialState()
}

/* =========================================
🔥 Resolve Route
========================================= */

export function
resolveNavigationRoute({
  state,
  semanticIntent,
}: {
  state:
    NavigationState

  semanticIntent?:
    SemanticIntent
}) {

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
    '🔥 Navigation Pipeline'
  )

  console.log({

    semanticUsage:
      semanticIntent?.usage,

    metrics,

  })

  return {
    state: updatedState,
    route,
    metrics,
  }
}