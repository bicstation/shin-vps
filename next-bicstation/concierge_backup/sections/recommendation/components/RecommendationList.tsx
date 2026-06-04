// /app/concierge/sections/recommendation/components/RecommendationList.tsx

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '../../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 COMPONENTS
========================================= */

import RecommendationCard
  from './RecommendationCard'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './RecommendationList.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  recommendations?:
    RecommendationPayload[]
}

/* =========================================
🔥 Recommendation List
========================================= */

export default function
RecommendationList({
  recommendations = [],
}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (
    !recommendations.length
  ) {

    return null
  }

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={styles.list}
    >

      {recommendations.map(
        (
          recommendation,
          index
        ) => (

          <RecommendationCard
            key={
              recommendation.id
              || index
            }

            recommendation={
              recommendation
            }
          />

        )
      )}

    </section>
  )
}