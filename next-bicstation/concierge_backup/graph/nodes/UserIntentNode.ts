// /app/concierge/graph/nodes/UserIntentNode.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 User Intent Node
========================================= */

export type UserIntentNode = {

  id: string

  type:
    'intent'

  label: string

  intent:
    SemanticIntent

  confidence?: number

  metadata?: Record<
    string,
    any
  >

  created_at: string
}

/* =========================================
🔥 Factory
========================================= */

export const createUserIntentNode = ({
  intent,
  confidence,
  metadata,
}: {
  intent:
    SemanticIntent

  confidence?: number

  metadata?: Record<
    string,
    any
  >
}): UserIntentNode => {

  const usage =

    intent?.usage
    || 'general'

  return {

    id:
      `intent-${usage}`,

    type:
      'intent',

    label:
      `${usage}_intent`,

    intent,

    confidence:
      confidence || 0.9,

    metadata:
      metadata || {},

    created_at:
      new Date()
        .toISOString(),

  }
}

/* =========================================
🔥 Helpers
========================================= */

export const normalizeUserIntentNode = (
  node?: Partial<
    UserIntentNode
  >
): UserIntentNode => {

  return {

    id:
      node?.id
      || crypto.randomUUID(),

    type:
      'intent',

    label:
      node?.label
      || 'intent_node',

    intent:
      node?.intent
      || {},

    confidence:
      node?.confidence
      || 0.5,

    metadata:
      node?.metadata
      || {},

    created_at:
      node?.created_at
      || new Date()
        .toISOString(),

  }
}

export const isHighConfidenceIntent = (
  node?: UserIntentNode
) => {

  return (
    (node?.confidence || 0)
    >= 0.8
  )
}

export const resolveIntentUsage = (
  node?: UserIntentNode
) => {

  return (
    node?.intent?.usage
    || 'general'
  )
}

export default UserIntentNode