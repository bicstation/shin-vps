// /app/concierge/components/TypingIndicator.tsx

'use client'

import React from 'react'
import styles from './TypingIndicator.module.css'

export default function TypingIndicator() {
  return (
    <div className={styles.typingWrapper}>
      <div className={styles.dot} />
      <div className={styles.dot} />
      <div className={styles.dot} />
    </div>
  )
}