// /app/concierge/lib/core/helpers.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

import type {
  RecommendationPayload,
} from '@/app/concierge/contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 Safe Array
========================================= */

export function
safeArray<T>(
  value?: T[]
): T[] {

  return Array.isArray(
    value
  )
    ? value
    : []
}

/* =========================================
🔥 Safe String
========================================= */

export function
safeString(
  value?: string | null
): string {

  return (
    value
      ?.trim()
    || ''
  )
}

/* =========================================
🔥 Safe Number
========================================= */

export function
safeNumber(
  value?: number | string | null
): number {

  if (
    typeof value
    === 'number'
  ) {

    return value
  }

  if (
    typeof value
    === 'string'
  ) {

    const parsed =
      Number(value)

    return Number.isNaN(
      parsed
    )
      ? 0
      : parsed
  }

  return 0
}

/* =========================================
🔥 Is Empty
========================================= */

export function
isEmpty(
  value?: any
): boolean {

  if (
    value == null
  ) {

    return true
  }

  if (
    typeof value
    === 'string'
  ) {

    return (
      value.trim()
      === ''
    )
  }

  if (
    Array.isArray(value)
  ) {

    return (
      value.length === 0
    )
  }

  if (
    typeof value
    === 'object'
  ) {

    return (
      Object.keys(value)
        .length === 0
    )
  }

  return false
}

/* =========================================
🔥 Latest Message
========================================= */

export function
getLatestMessage(
  messages:
    ConversationMessage[] = []
) {

  return safeArray(
    messages
  )[
    messages.length - 1
  ]
}

/* =========================================
🔥 User Messages
========================================= */

export function
getUserMessages(
  messages:
    ConversationMessage[] = []
) {

  return safeArray(
    messages
  ).filter(
    item => (
      item?.role
      === 'user'
    )
  )
}

/* =========================================
🔥 Assistant Messages
========================================= */

export function
getAssistantMessages(
  messages:
    ConversationMessage[] = []
) {

  return safeArray(
    messages
  ).filter(
    item => (
      item?.role
      === 'assistant'
    )
  )
}

/* =========================================
🔥 Sort Recommendations
========================================= */

export function
sortRecommendations(
  recommendations:
    RecommendationPayload[] = []
) {

  return safeArray(
    recommendations
  ).sort(
    (a, b) => (

      (b?.score || 0)
      -
      (a?.score || 0)

    )
  )
}

/* =========================================
🔥 Top Recommendation
========================================= */

export function
getTopRecommendation(
  recommendations:
    RecommendationPayload[] = []
) {

  return sortRecommendations(
    recommendations
  )?.[0]
}

/* =========================================
🔥 Format Date
========================================= */

export function
formatDate(
  value?: string
): string {

  if (
    !value
  ) {

    return ''
  }

  try {

    return new Date(value)
      .toLocaleString(
        'ja-JP'
      )

  } catch {

    return ''
  }
}

/* =========================================
🔥 Sleep
========================================= */

export function
sleep(
  ms = 300
) {

  return new Promise(
    resolve => {

      setTimeout(
        resolve,
        ms
      )
    }
  )
}

/* =========================================
🔥 Random ID
========================================= */

export function
randomId(): string {

  return crypto.randomUUID()
}

/* =========================================
🔥 Clamp
========================================= */

export function
clamp({
  value,
  min,
  max,
}: {
  value: number
  min: number
  max: number
}) {

  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  )
}