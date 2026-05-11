// /app/concierge/runtime/memory/algorithms/mergeSemanticMemory.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticMemoryState,
} from '@/app/concierge/contracts/semantic/SemanticMemoryState'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticMemoryDomain
  from '@/app/concierge/domain/memory/semanticMemoryDomain'

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