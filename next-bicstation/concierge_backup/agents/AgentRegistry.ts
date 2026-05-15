// /app/concierge/agents/AgentRegistry.ts

/* =========================================
🔥 AGENT REGISTRY
========================================= */

import type { ReasoningAgent } from './reasoning/ReasoningAgent'
import type { RecommendationAgent } from './recommendation/RecommendationAgent'
import type { RuntimeAgent } from './runtime/RuntimeAgent'
import type { AIAgent } from './specialists/AIAgent'
import type { BusinessAgent } from './specialists/BusinessAgent'
import type { CreatorAgent } from './specialists/CreatorAgent'
import type { GamingAgent } from './specialists/GamingAgent'

/* =========================================
🔥 Agent Registry Interface
========================================= */

export interface AgentRegistry {
  reasoningAgent: ReasoningAgent
  recommendationAgent: RecommendationAgent
  runtimeAgent: RuntimeAgent
  aiAgent: AIAgent
  businessAgent: BusinessAgent
  creatorAgent: CreatorAgent
  gamingAgent: GamingAgent
}

/* =========================================
🔥 Agent Registry Implementation (例)
========================================= */

export const agentRegistry: AgentRegistry = {} as AgentRegistry