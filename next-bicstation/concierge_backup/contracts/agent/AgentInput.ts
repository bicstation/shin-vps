// /app/concierge/contracts/agent/AgentInput.ts

/* =========================================
🔥 Agent Input Contract
========================================= */

export type AgentInput = {
  inputId: string
  sessionId: string
  userId: string
  message?: string
  query?: string
  context?: Record<string, any>
  timestamp?: string
}