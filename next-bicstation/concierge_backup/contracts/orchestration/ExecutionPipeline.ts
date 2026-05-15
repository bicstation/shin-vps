// /app/concierge/contracts/orchestration/ExecutionPipeline.ts

/* =========================================
🔥 Execution Pipeline Contract
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