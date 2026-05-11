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

export default function HistorySection({
  messages = [],
}: Props) {

  if (!messages.length) {

    return (
      <div className={styles.historyEmpty}>
        No conversation history.
      </div>
    )
  }

  return (

    <section
      className={styles.historySection}
    >

      <div className={styles.historyList}>

        {messages.map(
          (msg, idx) => (

            <div
              key={idx}
              className={styles.historyItem}
            >

              <div
                className={styles.historyMeta}
              >

                <span
                  className={styles.historyRole}
                >
                  {msg.role.toUpperCase()}
                </span>

                {msg.created_at && (
                  <span
                    className={styles.historyTime}
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

              <div
                className={styles.historyContent}
              >
                {msg.content}
              </div>

            </div>

          )
        )}

      </div>

    </section>
  )
}