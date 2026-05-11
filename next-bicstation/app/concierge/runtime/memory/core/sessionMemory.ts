// /app/concierge/runtime/memory/core/sessionMemory.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SessionMemoryState,
} from '../../../contracts/memory/SessionMemoryState'

/* =========================================
🔥 DOMAIN
========================================= */

import {
  SessionMemoryDomain,
} from '../../../domain/memory/sessionMemoryDomain'

/* =========================================
🔥 Session Memory
========================================= */

export function
createSessionMemory():
SessionMemoryState {

  return SessionMemoryDomain
    .createInitialState()
}

/* =========================================
🔥 Update Session Memory
========================================= */

export function
updateSessionMemory({
  state,
  data,
}: {
  state:
    SessionMemoryState

  data: Record<string, any>
}): SessionMemoryState {

  return SessionMemoryDomain
    .updateMemory({

      state,
      data,

    })
}

/* =========================================
🔥 Merge Session Memory
========================================= */

export function
mergeSessionMemory({
  previous,
  next,
}: {
  previous?: SessionMemoryState
  next?: SessionMemoryState
}): SessionMemoryState {

  return SessionMemoryDomain
    .mergeMemory({

      previous,
      next,

    })
}