// /app/concierge/types/agent/recommendation-agent.ts

/* =========================================
🔥 RECOMMENDATION AGENT TYPES
========================================= */

import type { SemanticIntent } from '@/app/concierge/contracts/semantic/SemanticIntent'
import type { RecommendationPayload } from '@/app/concierge/contracts/recommendation/RecommendationPayload'

export type RecommendationAgent = {
  id: string
  name: string
  description?: string
  execute: (intent?: SemanticIntent) => Promise<RecommendationPayload[]>
}