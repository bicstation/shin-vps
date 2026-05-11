// /app/concierge/contracts/runtime/RuntimeState.ts

/* =========================================
🔥 Runtime State Contract
========================================= */

export type RuntimeState = {
  runtimeId: string

  activeFlowId?: string

  status: 'idle' | 'running' | 'completed' | 'error'

  currentStep?: string

  metadata?: Record<string, any>

  error?: string

  startedAt?: string
  updatedAt?: string
  completedAt?: string
}