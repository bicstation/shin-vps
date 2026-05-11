// /app/concierge/contracts/agent/AgentDecision.ts

/* =========================================
🔥 Agent Decision Contract
========================================= */

export type AgentDecision = {
  decisionId: string
  agentId: string
  action: string
  target?: string
  confidence?: number
  reasoning?: string
  timestamp?: string
}