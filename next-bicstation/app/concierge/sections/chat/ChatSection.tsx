// /app/concierge/sections/chat/ChatSection.tsx

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  ConversationMessage,
} from '../contracts/conversation/ConversationMessage'

/* =========================================
🔥 COMPONENTS
========================================= */

import ChatMessageList
  from './components/ChatMessageList'

import SuggestionChips
  from './components/SuggestionChips'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './ChatSection.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  messages?: ConversationMessage[]

  suggestions?: { name: string; slug: string }[]

  onSuggestionClick?: (slug: string) => void
}

/* =========================================
🔥 Chat Section
========================================= */

export default function ChatSection({
  messages = [],
  suggestions = [],
  onSuggestionClick,
}: Props) {

  return (

    <section
      className={styles.chatSection}
    >

      {/* =============================== */}
      {/* Message List */}
      {/* =============================== */}

      <ChatMessageList
        messages={messages}
      />

      {/* =============================== */}
      {/* Suggestions */}
      {/* =============================== */}

      <SuggestionChips
        suggestions={suggestions}
        onClick={onSuggestionClick}
      />

    </section>
  )
}