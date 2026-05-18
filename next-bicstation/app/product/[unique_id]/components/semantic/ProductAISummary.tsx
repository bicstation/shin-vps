// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/components/semantic/ProductAISummary.tsx
// ============================================================================

import styles
  from './semantic.module.css'

type Props = {
  product: any
}

/* ============================================================================
🔥 PARSER
============================================================================ */

function parseSummary(
  summary: string
) {

  if (!summary) {
    return {
      points: [],
      target: '',
    }
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  const cleaned =
    summary

      .replace(
        /\[SUMMARY_DATA\]/g,
        ''
      )

      .replace(
        /\[\/SUMMARY_DATA\]/g,
        ''
      )

      .trim()

  // ==========================================================================
  // Extract
  // ==========================================================================

  const pointRegex =
    /POINT\d+:(.*?)(?=POINT\d+:|TARGET:|$)/gs

  const targetRegex =
    /TARGET:(.*)$/s

  const points =
    Array.from(
      cleaned.matchAll(
        pointRegex
      )
    )

      .map(
        (match) =>
          match[1]?.trim()
      )

      .filter(Boolean)

  const targetMatch =
    cleaned.match(
      targetRegex
    )

  const target =
    targetMatch?.[1]
      ?.trim()
      || ''

  return {
    points,
    target,
  }

}

/* ============================================================================
🔥 COMPONENT
============================================================================ */

export default function ProductAISummary({
  product,
}: Props) {

  // ==========================================================================
  // Empty
  // ==========================================================================

  if (!product?.ai_summary) {
    return null
  }

  // ==========================================================================
  // Parse
  // ==========================================================================

  const {
    points,
    target,
  } = parseSummary(
    product.ai_summary
  )

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <section
      className={styles.aiSummary}
    >

      {/* ================================================================
      HEADER
      ================================================================ */}

      <div
        className={styles.aiSummaryHeader}
      >

        <div
          className={styles.aiSummaryLabel}
        >

          AI SUMMARY

        </div>

        <h2
          className={styles.aiSummaryTitle}
        >

          このPCの特徴

        </h2>

      </div>

      {/* ================================================================
      POINTS
      ================================================================ */}

      {
        points.length > 0 && (

          <ul
            className={styles.aiSummaryList}
          >

            {
              points.map(
                (
                  point,
                  index
                ) => (

                  <li
                    key={index}

                    className={
                      styles.aiSummaryItem
                    }
                  >

                    {point}

                  </li>

                )
              )
            }

          </ul>

        )
      }

      {/* ================================================================
      TARGET
      ================================================================ */}

      {
        target && (

          <div
            className={styles.aiSummaryTarget}
          >

            <span
              className={
                styles.aiSummaryTargetLabel
              }
            >

              おすすめ用途

            </span>

            <span
              className={
                styles.aiSummaryTargetText
              }
            >

              {target}

            </span>

          </div>

        )
      }

    </section>

  )
}