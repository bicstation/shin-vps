// /app/concierge/system/config/runtime.config.ts

/* =========================================
🔥 Runtime Configuration
========================================= */

export const RUNTIME_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  semanticSchemaVersion: 1,
  defaultBudget: 250000,
  maxRecommendations: 8,
  defaultUsage: 'gaming',
  defaultGPU: 'rtx-4070',
  defaultCPU: 'i7-13700K',
  defaultMemory: '32GB',
  defaultStorage: '1TB',
}