// /app/concierge/contracts/agent/AgentCapability.ts

/* =========================================
🔥 Agent Capability Contract
========================================= */

export type AgentCapability = {
  id: string
  name: string
  description?: string
  type?: 'reasoning' | 'recommendation' | 'runtime' | 'specialist'
  version?: string
  supportedDomains?: string[]
  createdAt?: string
  updatedAt?: string
}