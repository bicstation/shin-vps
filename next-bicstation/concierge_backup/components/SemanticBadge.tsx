// /app/concierge/components/SemanticBadge.tsx

'use client'

import React from 'react'
import styles from './SemanticBadge.module.css'

type SemanticBadgeProps = {
  label: string
  icon?: string
  color?: string
}

export default function SemanticBadge({
  label,
  icon,
  color = '#4dabf7',
}: SemanticBadgeProps) {
  return (
    <div
      className={styles.badge}
      style={{ borderColor: color }}
    >
      {icon && (
        <span className={styles.icon}>
          {icon}
        </span>
      )}

      <span className={styles.label}>
        {label}
      </span>
    </div>
  )
}