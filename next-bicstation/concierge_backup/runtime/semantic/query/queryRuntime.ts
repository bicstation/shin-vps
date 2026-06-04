// /app/concierge/runtime/semantic/query/queryRuntime.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticFinderQuery,
} from '../../../contracts/semantic/SemanticFinderQuery'

import type {
  SemanticIntent,
} from '../../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticDomain
  from '../../../domain/semantic/semanticDomain'

/* =========================================
🔥 TYPES
========================================= */

export type SemanticQueryRuntimeResult = {

  semanticIntent?:
    SemanticIntent

  metrics: {

    queryKeys:
      number
  }
}

/* =========================================
🔥 Execute Semantic Query Runtime
========================================= */

export function
executeSemanticQueryRuntime({
  query,
}: {
  query?: SemanticFinderQuery
}): SemanticQueryRuntimeResult {

  const semanticIntent =
    SemanticDomain
      .resolveSemanticIntentFromQuery(
        query
      )

  const metrics = {

    queryKeys:
      Object.keys(query || {}).length,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Query Runtime'
  )

  console.log({

    queryKeys:
      metrics.queryKeys,

    usage:
      semanticIntent?.usage || null,

  })

  return {

    semanticIntent,

    metrics,
  }
}