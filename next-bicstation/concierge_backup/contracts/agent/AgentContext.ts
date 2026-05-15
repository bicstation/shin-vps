// /app/concierge/contracts/agent/AgentContext.ts

/* =========================================
🔥 Agent Context Contract
========================================= */

export type AgentContext = {
  sessionId: string
  userId: string
  currentFlow?: string
  conversationHistory?: any[]
  semanticAttributes?: Record<string, any>
  recommendationContext?: Record<string, any>
  timestamp?: string
}