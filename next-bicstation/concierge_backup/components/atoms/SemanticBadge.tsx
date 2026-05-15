// /app/concierge/components/atoms/SemanticBadge.tsx

import React from 'react'
import styles from './SemanticBadge.module.css'

type SemanticBadgeProps = {
  label: string
  color?: string
  icon?: string
}

export default function SemanticBadge({
  label,
  color = '#4dabf7',
  icon,
}: SemanticBadgeProps) {
  return (
    <div
      className={styles.badge}
      style={{ borderColor: color }}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </div>
  )
}