// /app/concierge/contracts/semantic/SemanticMemoryState.ts

/* =========================================
🔥 Semantic Memory State Contract
========================================= */

import type { SemanticIntent } from './SemanticIntent'
import type { SemanticScore } from './SemanticScore'

export type SemanticMemoryState = {
  sessionId: string

  intents: SemanticIntent[]

  scores?: SemanticScore[]

  groupedAttributes?: Record<string, any>

  semanticContext?: Record<string, any>

  lastUpdated?: string
}