// /app/concierge/contracts/runtime/RuntimeSession.ts

/* =========================================
🔥 Runtime Session Contract
========================================= */

export type RuntimeSession = {
  sessionId: string
  userId: string
  runtimeId: string
  activeFlowId?: string
  startedAt: string
  lastUpdated?: string
  state?: Record<string, any>
}