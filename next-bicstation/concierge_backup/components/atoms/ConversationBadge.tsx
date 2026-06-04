// /app/concierge/components/atoms/ConversationBadge.tsx

import React from 'react'
import styles from './ConversationBadge.module.css'

type ConversationBadgeProps = {
  label: string
  count?: number
  color?: string
}

export default function ConversationBadge({
  label,
  count,
  color = '#4dabf7',
}: ConversationBadgeProps) {
  return (
    <div
      className={styles.badge}
      style={{ borderColor: color }}
    >
      <span className={styles.label}>{label}</span>
      {count !== undefined && (
        <span className={styles.count}>{count}</span>
      )}
    </div>
  )
}