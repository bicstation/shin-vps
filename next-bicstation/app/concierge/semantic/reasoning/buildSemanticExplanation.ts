// /app/concierge/semantic/reasoning/buildSemanticExplanation.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 Build Semantic Explanation
========================================= */

export function buildSemanticExplanation(
  semanticIntent?: SemanticIntent
): string {

  const usage = semanticIntent?.usage || '不明'
  const gpu = semanticIntent?.gpu || '不明'
  const budget = semanticIntent?.budget || '指定なし'

  return `Semantic Explanation:
  - Primary Usage: ${usage}
  - GPU Preference: ${gpu}
  - Budget Constraint: ${budget}`
}