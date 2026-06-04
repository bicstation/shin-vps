// /app/concierge/components/ConciergeError.tsx

'use client'

import React from 'react'
import styles from './ConciergeError.module.css'

type ConciergeErrorProps = {
  title?: string
  message?: string
  onRetry?: () => void
}

export default function ConciergeError({
  title = 'エラーが発生しました',
  message = '時間を置いて再度お試しください。',
  onRetry,
}: ConciergeErrorProps) {
  return (
    <div className={styles.errorWrapper}>
      <div className={styles.errorCard}>
        <h2 className={styles.title}>{title}</h2>

        <p className={styles.message}>{message}</p>

        {onRetry && (
          <button
            type="button"
            className={styles.retryButton}
            onClick={onRetry}
          >
            再試行
          </button>
        )}
      </div>
    </div>
  )
}