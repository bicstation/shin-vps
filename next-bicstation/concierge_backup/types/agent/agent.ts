// /app/concierge/types/agent/agent.ts

/* =========================================
🔥 AGENT TYPES
========================================= */

export type Agent = {
  id: string
  name: string
  description?: string
  execute: (...args: any[]) => any
}