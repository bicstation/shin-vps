// /app/concierge/contracts/semantic/SemanticIntent.ts

/* =========================================
🔥 Semantic Intent Contract
========================================= */

export type SemanticIntent = {
  intentId: string
  sessionId: string
  userId: string
  type: 'usage' | 'gpu' | 'cpu' | 'maker' | 'memory' | 'storage' | 'workload' | 'ai'
  value: string
  confidence?: number
  timestamp?: string
}