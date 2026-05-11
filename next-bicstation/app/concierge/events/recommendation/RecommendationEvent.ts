// /app/concierge/events/recommendation/RecommendationEvent.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '../../contracts/recommendation/RecommendationPayload'

import type {
  SemanticIntent,
} from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 Recommendation Event Type
========================================= */

export type RecommendationEventType =

  | 'recommendation.started'
  | 'recommendation.scored'
  | 'recommendation.filtered'
  | 'recommendation.sorted'
  | 'recommendation.completed'
  | 'recommendation.clicked'
  | 'recommendation.error'

/* =========================================
🔥 Recommendation Event Payload
========================================= */

export type RecommendationEventPayload = {

  recommendation?:
    RecommendationPayload

  recommendations?:
    RecommendationPayload[]

  semanticIntent?:
    SemanticIntent

  error?:
    string | null

  metadata?:
    Record<string, any>
}

/* =========================================
🔥 Recommendation Event
========================================= */

export type RecommendationEvent = {

  id: string

  type:
    RecommendationEventType

  payload:
    RecommendationEventPayload

  created_at:
    string
}

/* =========================================
🔥 Factory
========================================= */

export const createRecommendationEvent = ({
  type,
  payload,
}: {
  type:
    RecommendationEventType

  payload:
    RecommendationEventPayload
}): RecommendationEvent => {

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

export const isRecommendationErrorEvent = (
  event?: RecommendationEvent
) => {

  return (
    event?.type
    === 'recommendation.error'
  )
}

export const isRecommendationCompletedEvent = (
  event?: RecommendationEvent
) => {

  return (
    event?.type
    === 'recommendation.completed'
  )
}

export const isRecommendationClickedEvent = (
  event?: RecommendationEvent
) => {

  return (
    event?.type
    === 'recommendation.clicked'
  )
}

export default RecommendationEvent