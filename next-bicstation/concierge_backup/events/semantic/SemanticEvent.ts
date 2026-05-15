// /app/concierge/events/semantic/SemanticEvent.ts
// /app/concierge/events/semantic/SemanticEvent.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

import type {
  SemanticPayload,
} from '../../contracts/semantic/SemanticPayload'

/* =========================================
🔥 Semantic Event Type
========================================= */

export type SemanticEventType =

  | 'semantic.extraction.started'
  | 'semantic.extraction.completed'
  | 'semantic.intent.resolved'
  | 'semantic.graph.built'
  | 'semantic.routing.completed'
  | 'semantic.score.calculated'
  | 'semantic.error'

/* =========================================
🔥 Semantic Event Payload
========================================= */

export type SemanticEventPayload = {

  semanticIntent?:
    SemanticIntent

  semanticPayload?:
    SemanticPayload

  summary?:
    string

  error?:
    string | null

  metadata?:
    Record<string, any>
}

/* =========================================
🔥 Semantic Event
========================================= */

export type SemanticEvent = {

  id: string

  type:
    SemanticEventType

  payload:
    SemanticEventPayload

  created_at:
    string
}

/* =========================================
🔥 Factory
========================================= */

export const createSemanticEvent = ({
  type,
  payload,
}: {
  type:
    SemanticEventType

  payload:
    SemanticEventPayload
}): SemanticEvent => {

  return {

    id:
      crypto.randomUUID(),

    type,

    payload,

    created_at:
      new Date()
        .toISOString(),

  }
}

/* =========================================
🔥 Helpers
========================================= */

export const isSemanticErrorEvent = (
  event?: SemanticEvent
) => {

  return (
    event?.type
    === 'semantic.error'
  )
}

export const isSemanticResolvedEvent = (
  event?: SemanticEvent
) => {

  return (
    event?.type
    === 'semantic.intent.resolved'
  )
}

export const isSemanticGraphEvent = (
  event?: SemanticEvent
) => {

  return (
    event?.type
    === 'semantic.graph.built'
  )
}

export default SemanticEvent