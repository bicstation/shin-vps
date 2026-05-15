// /app/concierge/components/ChatMessageList.tsx

'use client'

import React from 'react'

import ChatMessage
  from './ChatMessage'

import styles
  from './ChatMessageList.module.css'

/* =========================================
🔥 TYPES
========================================= */

type Message = {
  id: string

  role:
    | 'user'
    | 'assistant'
    | 'system'

  content: string

  timestamp?: string
}

/* =========================================
🔥 Props
========================================= */

type ChatMessageListProps = {

  messages?: Message[]
}

/* =========================================
🔥 Chat Message List
========================================= */

export default function
ChatMessageList({

  messages = [],

}: ChatMessageListProps) {

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
          styles.emptyState
        }
      >
        メッセージはまだありません。
      </div>

    )
  }

  // ======================================
  // Render
  // ======================================

  return (

    <div
      className={
        styles.listWrapper
      }
    >

      {safeMessages.map((message) => (

        <ChatMessage
          key={message.id}

          role={message.role}

          content={message.content}

          timestamp={
            message.timestamp
          }
        />

      ))}

    </div>

  )
}