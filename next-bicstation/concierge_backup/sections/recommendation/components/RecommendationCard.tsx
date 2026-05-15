// /app/concierge/sections/recommendation/components/RecommendationCard.tsx

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '../../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './RecommendationCard.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {
  recommendation: RecommendationPayload
}

/* =========================================
🔥 Recommendation Card
========================================= */

export default function RecommendationCard({
  recommendation,
}: Props) {

  return (

    <div
      className={styles.card}
    >

      <h3 className={styles.title}>
        {recommendation.name}
      </h3>

      {recommendation.image_url && (
        <img
          src={recommendation.image_url}
          alt={recommendation.name}
          className={styles.image}
        />
      )}

      <p className={styles.description}>
        {recommendation.description}
      </p>

      <div className={styles.meta}>
        <span>Score: {recommendation.score?.toFixed(2)}</span>
      </div>

    </div>
  )
}