// /app/concierge/events/conversation/ConversationEvent.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../contracts/conversation/ConversationMessage'

import type {
  ConversationState,
} from '../../contracts/conversation/ConversationState'

/* =========================================
🔥 Conversation Event Type
========================================= */

export type ConversationEventType =

  | 'conversation.started'
  | 'conversation.message.created'
  | 'conversation.message.received'
  | 'conversation.intent.resolved'
  | 'conversation.processing'
  | 'conversation.completed'
  | 'conversation.error'
  | 'conversation.reset'

/* =========================================
🔥 Conversation Event Payload
========================================= */

export type ConversationEventPayload = {

  message?:
    ConversationMessage

  messages?:
    ConversationMessage[]

  state?:
    ConversationState

  error?:
    string | null

  metadata?:
    Record<string, any>
}

/* =========================================
🔥 Conversation Event
========================================= */

export type ConversationEvent = {

  id: string

  type:
    ConversationEventType

  payload:
    ConversationEventPayload

  created_at:
    string
}

/* =========================================
🔥 Factory
========================================= */

export const createConversationEvent = ({
  type,
  payload,
}: {
  type:
    ConversationEventType

  payload:
    ConversationEventPayload
}): ConversationEvent => {

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

export const isConversationErrorEvent = (
  event?: ConversationEvent
) => {

  return (
    event?.type
    === 'conversation.error'
  )
}

export const isConversationProcessingEvent = (
  event?: ConversationEvent
) => {

  return (
    event?.type
    === 'conversation.processing'
  )
}

export const isConversationCompletedEvent = (
  event?: ConversationEvent
) => {

  return (
    event?.type
    === 'conversation.completed'
  )
}

export default ConversationEvent