// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/RankingHero.tsx

import styles from '../page.module.css'

/* =========================================
🔥 Props
========================================= */

type RankingHeroProps = {

  title?: string

  description?: string

  semanticLabels?: string[]
}

/* =========================================
🔥 Default Semantic Labels
========================================= */

const DEFAULT_LABELS = [

  'usage',
  'GPU',
  'maker',
  'AI',
  'workload',
  'recommendation',
]

/* =========================================
🔥 Ranking Hero
========================================= */

export function RankingHero({
  title =
    'semantic recommendation platform',

  description =
    '用途・性能・semanticから最適な1台を探索',

  semanticLabels =
    DEFAULT_LABELS,
}: RankingHeroProps) {

  return (

    <section
      className={
        styles.hero
      }
    >

      {/* ================================= */}
      {/* Label */}
      {/* ================================= */}

      <div
        className={
          styles.heroLabel
        }
      >
        Semantic Ranking Explorer
      </div>

      {/* ================================= */}
      {/* Title */}
      {/* ================================= */}

      <h1
        className={
          styles.heroTitle
        }
      >
        {title}
      </h1>

      {/* ================================= */}
      {/* Description */}
      {/* ================================= */}

      <p
        className={
          styles.heroDescription
        }
      >
        {description}
      </p>

      {/* ================================= */}
      {/* Semantic Chips */}
      {/* ================================= */}

      <div
        className={
          styles.heroSemanticRow
        }
      >

        {semanticLabels.map(
          label => (

            <div
              key={label}

              className={
                styles.heroSemanticChip
              }
            >
              {label}
            </div>

          )
        )}

      </div>

    </section>
  )
}
