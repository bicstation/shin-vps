// /app/concierge/events/runtime/RuntimeEvent.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RuntimeContext,
} from '@/app/concierge/contracts/runtime/RuntimeContext'

/* =========================================
🔥 Runtime Event Type
========================================= */

export type RuntimeEventType =

  | 'runtime.boot'
  | 'runtime.ready'
  | 'runtime.processing'
  | 'runtime.idle'
  | 'runtime.shutdown'
  | 'runtime.error'
  | 'runtime.recovery'

/* =========================================
🔥 Runtime Event Payload
========================================= */

export type RuntimeEventPayload = {

  context?:
    RuntimeContext

  error?:
    string | null

  metadata?:
    Record<string, any>
}

/* =========================================
🔥 Runtime Event
========================================= */

export type RuntimeEvent = {

  id: string

  type:
    RuntimeEventType

  payload:
    RuntimeEventPayload

  created_at:
    string
}

/* =========================================
🔥 Factory
========================================= */

export const createRuntimeEvent = ({
  type,
  payload,
}: {
  type:
    RuntimeEventType

  payload:
    RuntimeEventPayload
}): RuntimeEvent => {

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

export const isRuntimeErrorEvent = (
  event?: RuntimeEvent
) => {

  return (
    event?.type
    === 'runtime.error'
  )
}

export const isRuntimeReadyEvent = (
  event?: RuntimeEvent
) => {

  return (
    event?.type
    === 'runtime.ready'
  )
}

export const isRuntimeProcessingEvent = (
  event?: RuntimeEvent
) => {

  return (
    event?.type
    === 'runtime.processing'
  )
}

export default RuntimeEvent