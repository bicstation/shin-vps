// /app/concierge/prompts/recommendationPrompt.ts

/* =========================================
🔥 Recommendation Prompt
========================================= */

import type {
  SemanticIntent,
} from '@/app/concierge/contracts/semantic/SemanticIntent'

export default function
recommendationPrompt({
  semanticIntent,
}: {
  semanticIntent?: SemanticIntent
}) {

  const promptBlocks: string[] = []

  promptBlocks.push(
    '### RECOMMENDATION INSTRUCTIONS'
  )

  if (semanticIntent?.usage) {

    promptBlocks.push(
      `Focus on usage: ${semanticIntent.usage}`
    )
  }

  if (semanticIntent?.budget) {

    promptBlocks.push(
      `Budget constraint: ${semanticIntent.budget}`
    )
  }

  if (semanticIntent?.gpu) {

    promptBlocks.push(
      `GPU preference: ${semanticIntent.gpu}`
    )
  }

  promptBlocks.push(
    'Provide top 3 PC recommendations with justification based on semantic similarity and balance.'
  )

  return promptBlocks.join('\n')
}