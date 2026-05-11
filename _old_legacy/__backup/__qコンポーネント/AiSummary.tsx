'use client'

import styles
  from './AiSummary.module.css'

/* =========================================
🔥 Types
========================================= */

type Summary = {
  p1?: string
  p2?: string
  p3?: string
  target?: string
}

type Props = {
  summary?: Summary | null
}

/* =========================================
🔥 Summary Card
========================================= */

function SummaryCard({
  text,
  index,
}: {
  text: string
  index: number
}) {

  return (
    <div
      className={
        styles.summaryCard
      }
    >

      <div
        className={
          styles.summaryIcon
        }
      >
        {index + 1}
      </div>

      <div
        className={
          styles.summaryText
        }
      >
        {text}
      </div>

    </div>
  )
}

/* =========================================
🔥 Component
========================================= */

export default function AiSummary({
  summary,
}: Props) {

  // --------------------------------
  // Empty
  // --------------------------------
  if (!summary) {
    return null
  }

  // --------------------------------
  // Summary Points
  // --------------------------------
  const points = [

    summary.p1,

    summary.p2,

    summary.p3,

  ].filter(Boolean)

  return (
    <section
      className={
        styles.section
      }
    >

      {/* ========================= */}
      {/* Header */}
      {/* ========================= */}

      <div
        className={
          styles.header
        }
      >

        <div
          className={
            styles.label
          }
        >
          AI Recommendation
        </div>

        <h2
          className={
            styles.title
          }
        >
          AIおすすめ分析
        </h2>

        <p
          className={
            styles.description
          }
        >
          semantic workload /
          recommendation balance /
          performance analysis
          に基づくAI分析。
        </p>

      </div>

      {/* ========================= */}
      {/* Main */}
      {/* ========================= */}

      <div
        className={
          styles.content
        }
      >

        {/* ================================= */}
        {/* summary */}
        {/* ================================= */}

        <div
          className={
            styles.summaryGrid
          }
        >

          {points.map((
            point,
            index
          ) => (

            <SummaryCard
              key={index}

              text={point}

              index={index}
            />

          ))}

        </div>

        {/* ================================= */}
        {/* target */}
        {/* ================================= */}

        {summary.target && (

          <div
            className={
              styles.targetCard
            }
          >

            <div
              className={
                styles.targetLabel
              }
            >
              Recommended For
            </div>

            <div
              className={
                styles.targetText
              }
            >
              ▶ {summary.target}
            </div>

          </div>

        )}

        {/* ================================= */}
        {/* semantic explanation */}
        {/* ================================= */}

        <div
          className={
            styles.explanation
          }
        >

          <div
            className={
              styles.explanationTitle
            }
          >
            Semantic Recommendation Insight
          </div>

          <div
            className={
              styles.explanationText
            }
          >
            AI recommendation analysis により、
            gaming /
            creator /
            workload /
            price balance を
            総合的に評価。
            semantic similarity を元に
            おすすめ構成を解析しています。
          </div>

        </div>

      </div>

    </section>
  )
}