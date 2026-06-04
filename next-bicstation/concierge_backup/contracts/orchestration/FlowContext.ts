// /app/concierge/contracts/orchestration/FlowContext.ts

/* =========================================
🔥 Flow Context Contract
========================================= */

export type FlowContext<T = any> = {
  flowId: string
  flowName: string
  input: T
  output?: any
  metadata?: Record<string, any>
  startedAt: string
  completedAt?: string
}