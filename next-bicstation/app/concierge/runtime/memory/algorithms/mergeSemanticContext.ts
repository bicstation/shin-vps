// /app/concierge/runtime/memory/algorithms/mergeSemanticContext.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

import type {
  SemanticMemoryState,
} from '@/app/concierge/contracts/semantic/SemanticMemoryState'

/* =========================================
🔥 TYPES
========================================= */

type MergeResult = {

  mergedIntent:
    SemanticIntent

  metrics: {

    previousUsage?: string

    nextUsage?: string

    mergedKeys:
      number
  }
}

/* =========================================
🔥 Merge Semantic Context
========================================= */

export function
mergeSemanticContext({
  previous,
  next,
}: {
  previous?:
    SemanticMemoryState

  next?:
    SemanticIntent
}): MergeResult {

  // ======================================
  // Previous Intent
  // ======================================

  const previousIntent =

    previous
      ?.semanticIntent || {}

  // ======================================
  // Merge
  // ======================================

  const mergedIntent = {

    ...previousIntent,

    ...next,

  } satisfies SemanticIntent

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    previousUsage:
      previousIntent
        ?.usage,

    nextUsage:
      next
        ?.usage,

    mergedKeys:

      Object.keys(
        mergedIntent
      ).length,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Merge Semantic Context'
  )

  console.log(
    metrics
  )

  // ======================================
  // Result
  // ======================================

  return {

    mergedIntent,

    metrics,
  }
}