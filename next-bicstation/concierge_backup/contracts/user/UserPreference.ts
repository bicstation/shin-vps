// /app/concierge/contracts/user/UserPreference.ts

/* =========================================
🔥 User Preference Contract
========================================= */

export type UserPreference = {
  userId: string

  preferredUsage?: string
  preferredGPU?: string
  preferredCPU?: string
  preferredMaker?: string

  preferredMemory?: string
  preferredStorage?: string

  preferredResolution?: string
  preferredPanel?: string

  preferredWorkload?: string
  preferredAI?: string

  preferredBudget?: number

  tags?: string[]

  createdAt?: string
  updatedAt?: string
}