// /app/concierge/contracts/semantic/SemanticPayload.ts

/* =========================================
🔥 Semantic Payload Contract
========================================= */

import type { SemanticAttribute } from './SemanticIntent'

export type SemanticPayload = {
  semantic_schema_version?: number
  attributes?: SemanticAttribute[]
  grouped_attributes?: Record<string, SemanticAttribute[]>
  timestamp?: string
}