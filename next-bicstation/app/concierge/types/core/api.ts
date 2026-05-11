// /app/concierge/types/core/api.ts

/* =========================================
🔥 CORE API TYPES
========================================= */

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  status?: number
}