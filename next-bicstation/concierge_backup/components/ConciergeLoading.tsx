// /app/concierge/components/ConciergeLoading.tsx

'use client'

import React from 'react'
import styles from './ConciergeLoading.module.css'

type ConciergeLoadingProps = {
  message?: string
}

export default function ConciergeLoading({
  message = '読み込み中...',
}: ConciergeLoadingProps) {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.spinner} />

      <p className={styles.message}>
        {message}
      </p>
    </div>
  )
}