// /app/concierge/transport/external/openaiTransport.ts

/* =========================================
🔥 EXTERNAL OPENAI TRANSPORT
========================================= */

import type { SemanticIntent } from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 Call OpenAI External
========================================= */

export async function callOpenAIExternal(
  prompt: string,
  intent?: SemanticIntent
): Promise<string> {

  console.log('Calling external OpenAI with prompt:', prompt)
  console.log('Semantic Intent:', intent)

  // TODO: Replace with actual OpenAI API call
  return Promise.resolve('External OpenAI response (mock)')
}