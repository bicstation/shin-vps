// /app/concierge/contracts/orchestration/FlowInput.ts

/* =========================================
🔥 Flow Input Contract
========================================= */

export type FlowInput<T = any> = {
  inputId: string
  flowId: string
  sessionId: string
  userId: string
  payload: T
  timestamp: string
}