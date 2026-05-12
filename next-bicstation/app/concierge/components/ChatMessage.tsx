// /app/concierge/components/ChatMessage.tsx

'use client'

import React from 'react'
import styles from './ChatMessage.module.css'

type ChatMessageProps = {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export default function ChatMessage({
  role,
  content,
  timestamp,
}: ChatMessageProps) {
  const roleClass =
    role === 'user'
      ? styles.user
      : role === 'assistant'
        ? styles.assistant
        : styles.system

  return (
    <div className={`${styles.messageWrapper} ${roleClass}`}>
      <div className={styles.messageBubble}>
        <div className={styles.messageContent}>
          {content}
        </div>

        {timestamp && (
          <div className={styles.timestamp}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  )
}