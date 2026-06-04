// /app/concierge/runtime/memory/algorithms/buildSemanticMemory.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../../contracts/semantic/SemanticIntent'

import type {
  SemanticMemoryState,
} from '../../../contracts/semantic/SemanticMemoryState'

/* =========================================
🔥 DOMAIN
========================================= */

import SemanticMemoryDomain
  from '../../../domain/memory/SemanticMemoryDomain'

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