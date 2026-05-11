// /app/concierge/transport/llm/openaiTransport.ts

/* =========================================
🔥 OPENAI TRANSPORT
========================================= */

import type { SemanticIntent } from '@/app/concierge/contracts/semantic/SemanticIntent'

import { callOpenAIExternal } from '../external/openaiTransport'

/* =========================================
🔥 OpenAI Transport
========================================= */

export async function openAITransport(
  prompt: string,
  intent?: SemanticIntent
): Promise<string> {

  console.log('OpenAI transport called with prompt:', prompt)
  console.log('Semantic Intent:', intent)

  const response = await callOpenAIExternal(prompt, intent)

  return response
}