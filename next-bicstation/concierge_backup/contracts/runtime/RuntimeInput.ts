// /app/concierge/contracts/runtime/RuntimeInput.ts

/* =========================================
🔥 Runtime Input Contract
========================================= */

export type RuntimeInput<T = any> = {
  inputId: string
  runtimeId: string
  flowId?: string
  sessionId: string
  userId: string
  payload: T
  timestamp: string
}