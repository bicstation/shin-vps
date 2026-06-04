// /app/concierge/sections/recommendation/RecommendationSection.tsx

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  RecommendationPayload,
} from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 COMPONENTS
========================================= */

import RecommendationList
  from './components/RecommendationList'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './RecommendationSection.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  title?: string

  description?: string

  recommendations?: RecommendationPayload[]
}

/* =========================================
🔥 Recommendation Section
========================================= */

export default function RecommendationSection({
  title = 'おすすめ構成',
  description = 'AIが解析した関連おすすめ構成です。',
  recommendations = [],
}: Props) {

  return (

    <section
      className={styles.recommendationSection}
    >

      <div
        className={styles.recommendationHeader}
      >

        <h2
          className={styles.recommendationTitle}
        >
          {title}
        </h2>

        {description && (
          <p
            className={styles.recommendationDescription}
          >
            {description}
          </p>
        )}

      </div>

      <RecommendationList
        recommendations={recommendations}
      />

    </section>
  )
}