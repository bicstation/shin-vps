// /app/concierge/runtime/memory/core/semanticMemory.ts

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

import {
  SemanticMemoryDomain,
} from '../../../domain/memory/SemanticMemoryDomain'

/* =========================================
🔥 Create Semantic Memory
========================================= */

export function
createSemanticMemory():
SemanticMemoryState {

  return SemanticMemoryDomain
    .createInitialState()
}

/* =========================================
🔥 Update Semantic Memory
========================================= */

export function
updateSemanticMemory({
  state,
  semanticIntent,
}: {
  state:
    SemanticMemoryState

  semanticIntent:
    SemanticIntent
}): SemanticMemoryState {

  return SemanticMemoryDomain
    .updateMemory({

      state,
      semanticIntent,

    })
}

/* =========================================
🔥 Merge Semantic Memory
========================================= */

export function
mergeSemanticMemory({
  previous,
  next,
}: {
  previous?:
    SemanticMemoryState

  next?:
    SemanticMemoryState
}): SemanticMemoryState {

  return SemanticMemoryDomain
    .mergeMemory({

      previous,
      next,

    })
}

/* =========================================
🔥 Resolve Semantic Memory
========================================= */

export function
resolveSemanticMemory({
  state,
}: {
  state:
    SemanticMemoryState
}) {

  const semanticIntent =
    state?.semanticIntent

  const metrics = {

    usage:
      semanticIntent
        ?.usage || null,

    budget:
      semanticIntent
        ?.budget || null,

    gpu:
      semanticIntent
        ?.gpu || null,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Memory'
  )

  console.log(
    metrics
  )

  return {

    state,

    semanticIntent,

    metrics,
  }
}