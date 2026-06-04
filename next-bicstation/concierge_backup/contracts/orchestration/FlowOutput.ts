// /app/concierge/contracts/orchestration/FlowOutput.ts

/* =========================================
🔥 Flow Output Contract
========================================= */

export type FlowOutput<T = any> = {
  outputId: string
  flowId: string
  sessionId: string
  userId: string
  result?: T
  timestamp: string
  errors?: string[]
}