// /app/concierge/runtime/memory/algorithms/buildSemanticMemory.ts

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
🔥 DOMAIN
========================================= */

import SemanticMemoryDomain
  from '@/app/concierge/domain/memory/semanticMemoryDomain'

/* =========================================
🔥 Build Semantic Memory
========================================= */

export function
buildSemanticMemory({
  state,
  semanticIntent,
}: {
  state: SemanticMemoryState
  semanticIntent: SemanticIntent
}): SemanticMemoryState {

  const updatedState =

    SemanticMemoryDomain
      .updateMemory({

        state,
        semanticIntent,

      })

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Build Semantic Memory'
  )

  console.log({
    usage:
      semanticIntent?.usage,
    state: updatedState,
  })

  return updatedState
}