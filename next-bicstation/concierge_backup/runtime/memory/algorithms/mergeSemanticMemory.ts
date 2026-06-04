// /app/concierge/runtime/memory/algorithms/mergeSemanticMemory.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticMemoryState,
} from '../../../contracts/semantic/SemanticMemoryState'

/* =========================================
🔥 DOMAIN
========================================= */

import type {
  SemanticMemoryDomain,
}  from '../../../domain/memory/SemanticMemoryDomain'

/* =========================================
🔥 Merge Semantic Memory
========================================= */

export function
mergeSemanticMemory({
  previous,
  next,
}: {
  previous?: SemanticMemoryState
  next?: SemanticMemoryState
}): SemanticMemoryState {

  const merged =

    SemanticMemoryDomain.mergeMemory({

      previous,

      next,

    })

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Merge Semantic Memory'
  )

  console.log({
    previousKeys:
      previous ? Object.keys(previous).length : 0,

    nextKeys:
      next ? Object.keys(next).length : 0,

    mergedKeys:
      Object.keys(merged).length,
  })

  return merged
}