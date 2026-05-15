// /app/concierge/domain/memory/semanticMemoryDomain.ts

/* =========================================
🔥 SEMANTIC MEMORY DOMAIN
========================================= */

import type { SemanticIntent } from '../../contracts/semantic/SemanticIntent'
import type { SemanticScore } from '../../contracts/semantic/SemanticScore'
import type { SemanticMemoryState } from '../../contracts/semantic/SemanticMemoryState'

/* =========================================
🔥 Create Initial Semantic Memory
========================================= */

export function createSemanticMemoryState(
  sessionId: string
): SemanticMemoryState {
  return {
    sessionId,
    intents: [],
    scores: [],
    groupedAttributes: {},
    semanticContext: {},
    lastUpdated: new Date().toISOString(),
  }
}

/* =========================================
🔥 Add Semantic Intent
========================================= */

export function addSemanticIntent(
  state: SemanticMemoryState,
  intent: SemanticIntent
): SemanticMemoryState {
  return {
    ...state,
    intents: [...state.intents, intent],
    lastUpdated: new Date().toISOString(),
  }
}

/* =========================================
🔥 Add Semantic Score
========================================= */

export function addSemanticScore(
  state: SemanticMemoryState,
  score: SemanticScore
): SemanticMemoryState {
  return {
    ...state,
    scores: [...(state.scores || []), score],
    lastUpdated: new Date().toISOString(),
  }
}

/* =========================================
🔥 Update Semantic Context
========================================= */

export function updateSemanticContext(
  state: SemanticMemoryState,
  context: Record<string, any>
): SemanticMemoryState {
  return {
    ...state,
    semanticContext: {
      ...state.semanticContext,
      ...context,
    },
    lastUpdated: new Date().toISOString(),
  }
}

/* =========================================
🔥 Update Grouped Attributes
========================================= */

export function updateGroupedAttributes(
  state: SemanticMemoryState,
  groupedAttributes: Record<string, any>
): SemanticMemoryState {
  return {
    ...state,
    groupedAttributes: {
      ...state.groupedAttributes,
      ...groupedAttributes,
    },
    lastUpdated: new Date().toISOString(),
  }
}