// /app/concierge/contracts/runtime/RuntimeOutput.ts

/* =========================================
🔥 Runtime Output Contract
========================================= */

export type RuntimeOutput<T = any> = {
  outputId: string
  runtimeId: string
  flowId?: string
  sessionId: string
  userId: string
  result?: T
  timestamp: string
  errors?: string[]
}