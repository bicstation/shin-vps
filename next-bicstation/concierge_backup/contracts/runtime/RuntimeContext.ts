// /app/concierge/contracts/runtime/RuntimeContext.ts

/* =========================================
🔥 Runtime Context Contract
========================================= */

export type RuntimeContext<T = any> = {
  runtimeId: string
  flowId?: string
  sessionId: string
  userId: string
  input?: T
  output?: any
  metadata?: Record<string, any>
  startedAt: string
  completedAt?: string
}