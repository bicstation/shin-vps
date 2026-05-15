// /app/concierge/types/orchestration/flow.ts

/* =========================================
🔥 ORCHESTRATION FLOW TYPES
========================================= */

export type FlowStep<T = any> = {
  id: string
  name: string
  execute: (input: T) => Promise<any>
  next?: FlowStep<T>
}

export type OrchestrationFlow<T = any> = {
  steps: FlowStep<T>[]
  run: (input: T) => Promise<any>
}