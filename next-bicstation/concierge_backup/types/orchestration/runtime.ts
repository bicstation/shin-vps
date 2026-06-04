// /app/concierge/types/orchestration/runtime.ts

/* =========================================
🔥 ORCHESTRATION RUNTIME TYPES
========================================= */

export type OrchestrationModule<T = any> = {
  id: string
  name: string
  execute: (input: T) => Promise<any>
}

export type OrchestrationResult<T = any> = {
  success: boolean
  data?: T
  error?: string
}