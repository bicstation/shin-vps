// /app/concierge/sections/semantic/SemanticCard.tsx

'use client'

import React from 'react'
import SemanticBadge from '../../components/SemanticBadge'
import styles from './SemanticCard.module.css'

export type SemanticCardItem = {
  id: string
  label: string
  value?: string
  icon?: string
  color?: string
  description?: string
}

type SemanticCardProps = {
  item: SemanticCardItem
}

export default function SemanticCard({
  item,
}: SemanticCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <SemanticBadge
          label={item.label}
          icon={item.icon}
          color={item.color}
        />
      </div>

      {item.value && (
        <div className={styles.value}>
          {item.value}
        </div>
      )}

      {item.description && (
        <p className={styles.description}>
          {item.description}
        </p>
      )}
    </div>
  )
}