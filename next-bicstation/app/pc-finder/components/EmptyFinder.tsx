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

  semanticUsage?: string
}

/* =========================================
🔥 Empty Finder
========================================= */

export default function
EmptyFinder({

  title =
    'semantic finder standby',

  description =
    `
用途と予算を選択すると
semantic recommendation を
表示します。
`,

  semanticUsage =
    'usage-gaming',

}: Props) {

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 EmptyFinder',
    {
      semanticUsage,
    }
  )

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.empty
      }
    >

      {/* ==================================
      Glow
      ================================== */}

      <div
        className={
          styles.emptyGlow
        }
      />

      {/* ==================================
      Icon
      ================================== */}

      <div
        className={
          styles.emptyIcon
        }
      >

        🧠

      </div>

      {/* ==================================
      Label
      ================================== */}

      <div
        className={
          styles.emptyLabel
        }
      >

        SEMANTIC FINDER

      </div>

      {/* ==================================
      Title
      ================================== */}

      <h2
        className={
          styles.emptyTitle
        }
      >

        {title}

      </h2>

      {/* ==================================
      Description
      ================================== */}

      <p
        className={
          styles.emptyText
        }
      >

        {description}

      </p>

      {/* ==================================
      Semantic
      ================================== */}

      <div
        className={
          styles.emptySemantic
        }
      >

        <div
          className={
            styles.emptySemanticLabel
          }
        >

          DEFAULT SEMANTIC

        </div>

        <div
          className={
            styles.emptySemanticValue
          }
        >

          {semanticUsage}

        </div>

      </div>

    </section>
  )
}