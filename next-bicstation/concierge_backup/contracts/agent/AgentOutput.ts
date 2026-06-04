// /app/concierge/contracts/agent/AgentOutput.ts

/* =========================================
🔥 Agent Output Contract
========================================= */

export type AgentOutput = {
  outputId: string
  agentId: string
  sessionId: string
  response?: string
  recommendations?: any[]
  actions?: string[]
  confidence?: number
  reasoning?: string
  timestamp?: string
}