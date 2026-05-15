// /app/concierge/types/core/runtime.ts

/* =========================================
🔥 RUNTIME TYPES
========================================= */

export type RuntimeModule = {
  id: string
  name: string
  execute: (...args: any[]) => any
}

export type RuntimeResult<T = any> = {
  success: boolean
  data?: T
  error?: string
}