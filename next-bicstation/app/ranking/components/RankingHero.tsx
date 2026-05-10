// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/RankingHero.tsx

import Link
  from 'next/link'

import styles
  from '../page.module.css'

/* =========================================
🔥 Props
========================================= */

type RankingHeroProps = {

  title?: string

  description?: string

  semanticLabels?: string[]
}

/* =========================================
🔥 Default Labels
========================================= */

const DEFAULT_LABELS = [

  'ゲーミングPC',
  'AI画像生成',
  '動画編集',
  'RTX 4070',
  'RTX 4080',
  'コスパ重視',
  '初心者向け',
  'クリエイター向け',
]

/* =========================================
🔥 Ranking Hero
========================================= */

export default function RankingHero({
  title =
    '用途から最適なPCを探す',

  description =
    'ゲーム・AI・動画編集など、やりたいことから最適なPCを比較できます。',

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
      {/* Background Glow */}
      {/* ================================= */}

      <div
        className={
          styles.heroGlow
        }
      />

      {/* ================================= */}
      {/* Inner */}
      {/* ================================= */}

      <div
        className={
          styles.heroInner
        }
      >

        {/* =============================== */}
        {/* Label */}
        {/* =============================== */}

        <div
          className={
            styles.heroLabel
          }
        >

          AI PC RANKING

        </div>

        {/* =============================== */}
        {/* Title */}
        {/* =============================== */}

        <h1
          className={
            styles.heroTitle
          }
        >

          {title}

        </h1>

        {/* =============================== */}
        {/* Description */}
        {/* =============================== */}

        <p
          className={
            styles.heroDescription
          }
        >

          {description}

        </p>

        {/* =============================== */}
        {/* Semantic Chips */}
        {/* =============================== */}

        <div
          className={
            styles.heroSemanticRow
          }
        >

          {semanticLabels.map(
            (
              label,
              index
            ) => (

              <Link

                key={
                  label
                  || index
                }

                href={
                  `/ranking/${encodeURIComponent(label)}`
                }

                className={
                  styles.heroSemanticChip
                }
              >

                {label}

              </Link>

            )
          )}

        </div>

      </div>

    </section>
  )
}