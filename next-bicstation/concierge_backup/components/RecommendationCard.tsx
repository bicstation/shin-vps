// /app/concierge/components/RecommendationCard.tsx

'use client'

import React from 'react'
import styles from './RecommendationCard.module.css'

export type RecommendationCardItem = {
  id: string
  name: string
  description?: string
  image_url?: string
  score?: number
}

type RecommendationCardProps = {
  item: RecommendationCardItem
  onClick?: () => void
}

export default function RecommendationCard({
  item,
  onClick,
}: RecommendationCardProps) {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={onClick}
    >
      {item.image_url && (
        <div className={styles.imageWrapper}>
          <img
            src={item.image_url}
            alt={item.name}
            className={styles.image}
          />
        </div>
      )}

      <div className={styles.content}>
        <h3 className={styles.title}>
          {item.name}
        </h3>

        {item.description && (
          <p className={styles.description}>
            {item.description}
          </p>
        )}

        {typeof item.score === 'number' && (
          <div className={styles.score}>
            Score: {item.score}
          </div>
        )}
      </div>
    </button>
  )
}