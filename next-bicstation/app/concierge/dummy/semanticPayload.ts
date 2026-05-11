// /app/concierge/dummy/semanticPayload.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../contracts/semantic/SemanticIntent'

/* =========================================
🔥 Dummy Semantic Payload
========================================= */

export const semanticPayload:
  SemanticIntent = {

  // ======================================
  // Usage
  // ======================================

  usage:
    'ai',

  // ======================================
  // GPU
  // ======================================

  gpu:
    'rtx',

  // ======================================
  // Budget
  // ======================================

  budget:
    300000,

  // ======================================
  // AI Workload
  // ======================================

  ai:
    true,

  // ======================================
  // Optional Runtime
  // ======================================

  memory:
    '32GB',

  storage:
    '2TB SSD',

  workload:
    'stable-diffusion',

}

export default semanticPayload