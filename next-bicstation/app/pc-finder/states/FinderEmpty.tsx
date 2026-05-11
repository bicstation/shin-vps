'use client'

/* =========================================
🔥 Next
========================================= */

import Link
  from 'next/link'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './FinderEmpty.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  title?: string

  description?: string

  semanticUsage?: string
}

/* =========================================
🔥 Finder Empty
========================================= */

export default function
FinderEmpty({

  title =
    'おすすめPCが見つかりませんでした',

  description =
    `
現在の条件では
semantic recommendation が
見つかりませんでした。

予算や用途を変更して
再検索してください。
`,

  semanticUsage =
    'usage-gaming',

}: Props) {

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 FinderEmpty',
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
        styles.section
      }
    >

      {/* ==================================
      Glow
      ================================== */}

      <div
        className={
          styles.glow
        }
      />

      {/* ==================================
      Content
      ================================== */}

      <div
        className={
          styles.content
        }
      >

        {/* ============================= */}
        {/* Icon */}
        {/* ============================= */}

        <div
          className={
            styles.icon
          }
        >

          🔍

        </div>

        {/* ============================= */}
        {/* Label */}
        {/* ============================= */}

        <div
          className={
            styles.label
          }
        >

          NO SEMANTIC RESULT

        </div>

        {/* ============================= */}
        {/* Title */}
        {/* ============================= */}

        <h2
          className={
            styles.title
          }
        >

          {title}

        </h2>

        {/* ============================= */}
        {/* Description */}
        {/* ============================= */}

        <p
          className={
            styles.description
          }
        >

          {description}

        </p>

        {/* ============================= */}
        {/* Semantic */}
        {/* ============================= */}

        <div
          className={
            styles.semanticBox
          }
        >

          <div
            className={
              styles.semanticLabel
            }
          >

            ACTIVE SEMANTIC

          </div>

          <div
            className={
              styles.semanticValue
            }
          >

            {semanticUsage}

          </div>

        </div>

        {/* ============================= */}
        {/* Actions */}
        {/* ============================= */}

        <div
          className={
            styles.actions
          }
        >

          <Link

            href="/pc-finder"

            className={
              styles.primaryButton
            }
          >

            👉 条件を変更する

          </Link>

          <Link

            href="/ranking"

            className={
              styles.secondaryButton
            }
          >

            ランキングを見る

          </Link>

        </div>

      </div>

    </section>

  )
}