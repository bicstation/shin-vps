// /app/concierge/sections/chat/components/ChatMessage.tsx

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '@/app/concierge/contracts/conversation/ConversationMessage'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './ChatMessage.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  message:
    ConversationMessage
}

/* =========================================
🔥 Chat Message
========================================= */

export default function
ChatMessage({
  message,
}: Props) {

  const isUser =

    message?.role
    === 'user'

  return (

    <div

      className={`

        ${styles.message}

        ${
          isUser
            ? styles.user
            : styles.assistant
        }

      `}
    >

      {/* ==================================
      Avatar
      ================================== */}

      <div
        className={
          styles.avatar
        }
      >

        {isUser
          ? '🧑'
          : '🤖'}

      </div>

      {/* ==================================
      Bubble
      ================================== */}

      <div
        className={
          styles.bubble
        }
      >

        <div
          className={
            styles.content
          }
        >

          {message?.content}

        </div>

        {/* ================================
        Meta
        ================================ */}

        <div
          className={
            styles.meta
          }
        >

          <span>
            {message?.role}
          </span>

          {message?.created_at && (

            <span>

              {new Date(
                message.created_at
              ).toLocaleTimeString(
                'ja-JP',
                {

                  hour:
                    '2-digit',

                  minute:
                    '2-digit',

                }
              )}

            </span>

          )}

        </div>

      </div>

    </div>
  )
}