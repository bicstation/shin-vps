// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductAISummary.tsx
// ============================================================================

import styles
  from './styles/ProductAISummary.module.css'

type Props = {

  product: any

  semanticRuntime?: {

    semantic_summary?: string

  }

}



/* ============================================================================
🔥 Helpers
============================================================================ */

function parseStrengths(
  strengths: any
): string[] {

  if (!strengths) {

    return []

  }

  if (
    Array.isArray(strengths)
  ) {

    return strengths

  }

  try {

    const parsed =
      JSON.parse(
        strengths
      )

    return Array.isArray(parsed)
      ? parsed
      : []

  }

  catch {

    return []

  }

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductAISummary({

  product,
  semanticRuntime,

}: Props) {

    console.log(
    'SUMMARY',
    semanticRuntime?.semantic_summary
    )

    console.log(
    'TARGET USER',
    product?.target_user
    )

    console.log(
    'STRENGTHS',
    product?.strengths
    )

  const summary =

    semanticRuntime
      ?.semantic_summary

  const targetUser =

    product?.target_user

  const strengths =

    parseStrengths(
      product?.strengths
    )

  if (
    !summary
    && !targetUser
    && strengths.length === 0
  ) {

    return null

  }

  return (

    <section
      className={
        styles.aiSummary
      }
    >

      <div
        className={
          styles.aiSummaryHeader
        }
      >

        <div
          className={
            styles.aiSummaryLabel
          }
        >
          AI SUMMARY
        </div>

        <h2
          className={
            styles.aiSummaryTitle
          }
        >
          この製品の要約
        </h2>

      </div>

      {

        summary && (

          <div
            className={
              styles.aiSummaryBlock
            }
          >

            <div
              className={
                styles.aiSummaryBlockLabel
              }
            >
              SEMANTIC SUMMARY
            </div>

            <p
              className={
                styles.aiSummaryText
              }
            >
              {summary}
            </p>

          </div>

        )

      }

      {

        targetUser && (

          <div
            className={
              styles.aiSummaryBlock
            }
          >

            <div
              className={
                styles.aiSummaryBlockLabel
              }
            >
              TARGET USER
            </div>

            <p
              className={
                styles.aiSummaryText
              }
            >
              {targetUser}
            </p>

          </div>

        )

      }

      {

        strengths.length > 0 && (

          <div
            className={
              styles.aiSummaryBlock
            }
          >

            <div
              className={
                styles.aiSummaryBlockLabel
              }
            >
              KEY STRENGTHS
            </div>

            <ul
              className={
                styles.aiSummaryList
              }
            >

              {

                strengths.map(
                  (
                    strength,
                    index
                  ) => (

                    <li
                      key={index}
                      className={
                        styles.aiSummaryItem
                      }
                    >
                      {strength}
                    </li>

                  )
                )

              }

            </ul>

          </div>

        )

      }

    </section>

  )

}