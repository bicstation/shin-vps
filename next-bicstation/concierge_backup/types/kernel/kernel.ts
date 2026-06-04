// /app/concierge/types/kernel/kernel.ts

/* =========================================
🔥 KERNEL TYPES
========================================= */

export type KernelModule = {
  id: string
  name: string
  version?: string
  execute: (...args: any[]) => any
}

export type KernelContext = {
  userId?: string
  sessionId?: string
  semanticIntent?: Record<string, any>
  timestamp?: string
}