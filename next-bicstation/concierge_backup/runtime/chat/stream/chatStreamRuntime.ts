// /app/concierge/runtime/chat/stream/chatStreamRuntime.ts

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../../contracts/conversation/ConversationMessage'

/* =========================================
🔥 TYPES
========================================= */

export type StreamChunk = {

  id: string

  content: string

  done?: boolean
}

export type ChatStreamResult = {

  chunks:
    StreamChunk[]

  fullText:
    string

  metrics: {

    chunkCount:
      number

    totalLength:
      number
  }
}

/* =========================================
🔥 Create Stream Chunk
========================================= */

export function
createStreamChunk({
  content,
  done = false,
}: {
  content: string
  done?: boolean
}): StreamChunk {

  return {

    id:
      crypto.randomUUID(),

    content,

    done,
  }
}

/* =========================================
🔥 Split Stream Text
========================================= */

export function
splitStreamText(
  text = '',
  size = 24
): string[] {

  if (
    !text
  ) {

    return []
  }

  const chunks: string[] = []

  for (
    let i = 0;
    i < text.length;
    i += size
  ) {

    chunks.push(
      text.slice(
        i,
        i + size
      )
    )
  }

  return chunks
}

/* =========================================
🔥 Execute Stream Runtime
========================================= */

export function
executeChatStreamRuntime({
  message,
}: {
  message?:
    ConversationMessage
}): ChatStreamResult {

  const content =

    message?.content
    || ''

  const rawChunks =

    splitStreamText(
      content
    )

  const chunks =

    rawChunks.map(
      (
        chunk,
        index
      ) => (

        createStreamChunk({

          content:
            chunk,

          done:

            index ===
            rawChunks.length - 1,

        })

      )
    )

  const metrics = {

    chunkCount:
      chunks.length,

    totalLength:
      content.length,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Chat Stream Runtime'
  )

  console.log(
    metrics
  )

  // ======================================
  // Result
  // ======================================

  return {

    chunks,

    fullText:
      content,

    metrics,
  }
}