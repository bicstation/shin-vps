// /app/concierge/prompts/semanticPrompt.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 Semantic Prompt
========================================= */

type Props = {

  semanticIntent?:
    SemanticIntent

  summary?: string
}

/* =========================================
🔥 Build Semantic Prompt
========================================= */

export default function
semanticPrompt({
  semanticIntent,
  summary,
}: Props) {

  const blocks: string[] = []

  // ======================================
  // Header
  // ======================================

  blocks.push(
    '### SEMANTIC CONTEXT'
  )

  // ======================================
  // Summary
  // ======================================

  if (
    summary
  ) {

    blocks.push(
      `Semantic Summary: ${summary}`
    )
  }

  // ======================================
  // Usage
  // ======================================

  if (
    semanticIntent?.usage
  ) {

    blocks.push(
      `Primary Usage: ${semanticIntent.usage}`
    )
  }

  // ======================================
  // Budget
  // ======================================

  if (
    semanticIntent?.budget
  ) {

    blocks.push(
      `Budget: ${semanticIntent.budget}`
    )
  }

  // ======================================
  // GPU
  // ======================================

  if (
    semanticIntent?.gpu
  ) {

    blocks.push(
      `GPU Preference: ${semanticIntent.gpu}`
    )
  }

  // ======================================
  // AI
  // ======================================

  if (
    semanticIntent?.ai
  ) {

    blocks.push(
      'AI / LLM workload detected'
    )
  }

  // ======================================
  // Runtime Instructions
  // ======================================

  blocks.push(
    'Interpret user intent semantically rather than literally.'
  )

  blocks.push(
    'Prioritize practical recommendations and explain reasoning clearly.'
  )

  // ======================================
  // Result
  // ======================================

  return blocks.join('\n')
}