// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/RankingHero.tsx

import Link
  from 'next/link'

import styles
  from '../page.module.css'

/* =========================================
🔥 Semantic Label
========================================= */

export type SemanticLabel = {

  name: string

  slug: string
}

/* =========================================
🔥 Props
========================================= */

type RankingHeroProps = {

  title?: string

  description?: string

  semanticLabels?: SemanticLabel[]
}

/* =========================================
🔥 Ranking Hero
========================================= */

export default function RankingHero({
  title =
    '用途から最適なPCを探す',

  description =
    'ゲーム・AI画像生成・動画編集など、やりたいことから最適なPCを比較できます。',

  semanticLabels = [],
}: RankingHeroProps) {

  // ======================================
  // Normalize
  // ======================================

  const normalizedLabels =

    Array.isArray(
      semanticLabels
    )

      ? semanticLabels.filter(
          item => (

            !!item?.name
            &&
            !!item?.slug

          )
        )

      : []

  // ======================================
  // Unique
  // ======================================

  const uniqueLabels =

    Array.from(

      new Map(

        normalizedLabels.map(
          item => ([
            item.slug,
            item,
          ])
        )

      ).values()

    )

  // ======================================
  // Render
  // ======================================

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

        {!!uniqueLabels.length && (

          <div
            className={
              styles.heroSemanticRow
            }
          >

            {uniqueLabels.map(
              (
                item,
                index
              ) => (

                <a

                  key={
                    item.slug
                    || index
                  }

                  href={
                    `/ranking/${item.slug}`
                  }

                  className={
                    styles.heroSemanticChip
                  }
                >

                  {item.name}

                </a>

              )
            )}

          </div>

        )}

      </div>

    </section>
  )
}