// /app/concierge/transport/llm/fetchOpenAITransport.ts

/* =========================================
🔥 FETCH OPENAI TRANSPORT
========================================= */

import type { SemanticIntent } from '@/app/concierge/contracts/semantic/SemanticIntent'

import { callOpenAI } from '../adapters/openaiAdapter'

/* =========================================
🔥 Fetch OpenAI Transport
========================================= */

export async function fetchOpenAITransport(
  prompt: string,
  intent?: SemanticIntent
): Promise<string> {

  console.log('Fetching OpenAI transport with prompt:', prompt)
  console.log('Semantic Intent:', intent)

  const response = await callOpenAI(prompt, intent)

  return response
}