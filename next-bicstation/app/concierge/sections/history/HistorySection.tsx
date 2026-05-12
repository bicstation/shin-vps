// /app/concierge/sections/history/HistorySection.tsx

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../contracts/conversation/ConversationMessage'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './HistorySection.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?: ConversationMessage[]
}

/* =========================================
🔥 History Section
========================================= */

export default function
HistorySection({

  messages = [],

}: Props) {

  // ======================================
  // Safe Messages
  // ======================================

  const safeMessages =

    Array.isArray(messages)
      ? messages
      : []

  // ======================================
  // Empty
  // ======================================

  if (!safeMessages.length) {

    return (

      <div
        className={
          styles.historyEmpty
        }
      >
        No conversation history.
      </div>

    )
  }

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.historySection
      }
    >

      <div
        className={
          styles.historyList
        }
      >

        {safeMessages.map(
          (msg, idx) => (

            <div
              key={
                msg?.id
                || idx
              }

              className={
                styles.historyItem
              }
            >

              {/* ===========================
              META
              =========================== */}

              <div
                className={
                  styles.historyMeta
                }
              >

                <span
                  className={
                    styles.historyRole
                  }
                >
                  {msg?.role
                    ?.toUpperCase?.()
                    || 'UNKNOWN'}
                </span>

                {msg?.created_at && (

                  <span
                    className={
                      styles.historyTime
                    }
                  >

                    {new Date(
                      msg.created_at
                    ).toLocaleTimeString(
                      'ja-JP',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}

                  </span>

                )}

              </div>

              {/* ===========================
              CONTENT
              =========================== */}

              <div
                className={
                  styles.historyContent
                }
              >
                {msg?.content
                  || ''}
              </div>

            </div>

          )
        )}

      </div>

    </section>

  )
}