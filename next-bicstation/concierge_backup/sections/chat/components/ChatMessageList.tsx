// /app/concierge/sections/chat/components/ChatMessageList.tsx

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../../../contracts/conversation/ConversationMessage'

/* =========================================
🔥 COMPONENTS
========================================= */

import ChatMessage
  from './ChatMessage'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './ChatMessageList.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages:
    ConversationMessage[]
}

/* =========================================
🔥 Chat Message List
========================================= */

export default function
ChatMessageList({
  messages = [],
}: Props) {

  return (

    <div
      className={
        styles.messageList
      }
    >

      {messages.map(
        (msg, idx) => (

          <ChatMessage
            key={idx}
            message={msg}
          />

        )
      )}

    </div>

  )
}