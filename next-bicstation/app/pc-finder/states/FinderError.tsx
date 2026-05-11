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
  from './FinderError.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  title?: string

  description?: string

  error?: any

  semanticUsage?: string
}

/* =========================================
🔥 Error Message
========================================= */

function resolveErrorMessage(
  error: any
) {

  if (
    typeof error
    === 'string'
  ) {

    return error
  }

  if (
    error?.message
  ) {

    return error.message
  }

  return `
semantic backend connection error
`
}

/* =========================================
🔥 Finder Error
========================================= */

export default function
FinderError({

  title =
    'PC Finder でエラーが発生しました',

  description =
    `
semantic recommendation backend
との通信に失敗しました。

API 接続または
semantic transport layer
を確認してください。
`,

  error,

  semanticUsage =
    'usage-gaming',

}: Props) {

  // ======================================
  // Error Message
  // ======================================

  const errorMessage =

    resolveErrorMessage(
      error
    )

  // ======================================
  // Debug
  // ======================================

  console.error(
    '\n🔥 ====================================='
  )

  console.error(
    '🔥 FINDER ERROR'
  )

  console.error({

    semanticUsage,

    errorMessage,

    rawError:
      error,

  })

  console.error(
    '🔥 =====================================\n'
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

          ⚠️

        </div>

        {/* ============================= */}
        {/* Label */}
        {/* ============================= */}

        <div
          className={
            styles.label
          }
        >

          FINDER ERROR

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
        {/* Error Box */}
        {/* ============================= */}

        <div
          className={
            styles.errorBox
          }
        >

          <div
            className={
              styles.errorLabel
            }
          >

            ERROR MESSAGE

          </div>

          <div
            className={
              styles.errorMessage
            }
          >

            {errorMessage}

          </div>

        </div>

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

            👉 再読み込み

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