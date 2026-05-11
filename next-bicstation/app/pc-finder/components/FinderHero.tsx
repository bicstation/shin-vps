// /home/maya/shin-dev/shin-vps/next-bicstation/app/pc-finder/components/FinderHero.tsx

'use client'

/* =========================================
🔥 Styles
========================================= */

import styles
  from '../styles/pcFinder.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  title?: string

  description?: string

  badge?: string
}

/* =========================================
🔥 Finder Hero
========================================= */

export default function
FinderHero({

  title =
    `
あなたに最適な
semantic構成を探す
`,

  description =
    `
gaming / creator / AI /
business workload semantic
を解析し、

backend semantic authority
に基づいて
最適なPCを提案します。
`,

  badge =
    'Semantic Recommendation Engine',

}: Props) {

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 FinderHero'
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

      {/* ==================================
      Glow
      ================================== */}

      <div
        className={
          styles.heroGlow
        }
      />

      {/* ==================================
      Inner
      ================================== */}

      <div
        className={
          styles.heroInner
        }
      >

        {/* ============================= */}
        {/* Badge */}
        {/* ============================= */}

        <div
          className={
            styles.heroBadge
          }
        >

          {badge}

        </div>

        {/* ============================= */}
        {/* Title */}
        {/* ============================= */}

        <h1
          className={
            styles.heroTitle
          }
        >

          {title}

        </h1>

        {/* ============================= */}
        {/* Description */}
        {/* ============================= */}

        <p
          className={
            styles.heroText
          }
        >

          {description}

        </p>

        {/* ============================= */}
        {/* Semantic Chips */}
        {/* ============================= */}

        <div
          className={
            styles.heroSemanticRow
          }
        >

          <div
            className={
              styles.heroSemanticChip
            }
          >

            🎮 Gaming

          </div>

          <div
            className={
              styles.heroSemanticChip
            }
          >

            🎬 Creator

          </div>

          <div
            className={
              styles.heroSemanticChip
            }
          >

            🤖 AI

          </div>

          <div
            className={
              styles.heroSemanticChip
            }
          >

            💼 Business

          </div>

        </div>

      </div>

    </section>
  )
}