// /app/concierge/components/ui/ChatInput.tsx

'use client'

import React, { useState } from 'react'
import styles from './ChatInput.module.css'

type ChatInputProps = {
  placeholder?: string
  onSend: (message: string) => void
}

export default function ChatInput({
  placeholder = 'メッセージを入力…',
  onSend,
}: ChatInputProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim() === '') return
    onSend(text.trim())
    setText('')
  }

  return (
    <form className={styles.chatInputForm} onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className={styles.chatInput}
      />
      <button type="submit" className={styles.sendButton}>
        送信
      </button>
    </form>
  )
}