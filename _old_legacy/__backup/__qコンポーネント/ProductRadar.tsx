'use client'

import ScoreRadarChart
  from '@/shared/components/molecules/ScoreRadarChart'

import styles
  from './ProductRadar.module.css'

/* =========================================
🔥 Types
========================================= */

type Props = {
  product: any
}

/* =========================================
🔥 Score Item
========================================= */

function ScoreItem({
  label,
  value,
}: {
  label: string
  value?: number
}) {

  const score =
    typeof value === 'number'
      ? Math.round(value)
      : 0

  return (
    <div
      className={
        styles.scoreItem
      }
    >

      <div
        className={
          styles.scoreLabel
        }
      >
        {label}
      </div>

      <div
        className={
          styles.scoreValue
        }
      >
        {score}
      </div>

    </div>
  )
}

/* =========================================
🔥 Component
========================================= */

export default function ProductRadar({
  product,
}: Props) {

  // --------------------------------
  // Empty
  // --------------------------------
  if (!product) {
    return null
  }

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
          Semantic Performance
        </div>

        <h2
          className={
            styles.title
          }
        >
          パフォーマンス分析
        </h2>

        <p
          className={
            styles.description
          }
        >
          gaming /
          creator /
          AI /
          portability /
          price-performance
          を含む semantic analysis。
        </p>

      </div>

      {/* ========================= */}
      {/* Main Surface */}
      {/* ========================= */}

      <div
        className={
          styles.surface
        }
      >

        {/* glow */}
        <div
          className={
            styles.glow
          }
        />

        {/* ===================== */}
        {/* Chart */}
        {/* ===================== */}

        <div
          className={
            styles.chartArea
          }
        >

          <ScoreRadarChart
            score_cpu={
              product.score_cpu
            }

            score_gpu={
              product.score_gpu
            }

            score_cost={
              product.score_cost
            }

            score_portable={
              product.score_portable
            }

            score_ai={
              product.score_ai
            }
          />

        </div>

        {/* ===================== */}
        {/* Scores */}
        {/* ===================== */}

        <div
          className={
            styles.scoreGrid
          }
        >

          <ScoreItem
            label="CPU"
            value={
              product.score_cpu
            }
          />

          <ScoreItem
            label="GPU"
            value={
              product.score_gpu
            }
          />

          <ScoreItem
            label="COST"
            value={
              product.score_cost
            }
          />

          <ScoreItem
            label="PORTABLE"
            value={
              product.score_portable
            }
          />

          <ScoreItem
            label="AI"
            value={
              product.score_ai
            }
          />

        </div>

        {/* ===================== */}
        {/* Semantic Notes */}
        {/* ===================== */}

        <div
          className={
            styles.notes
          }
        >

          <div
            className={
              styles.noteCard
            }
          >

            <div
              className={
                styles.noteTitle
              }
            >
              🎮 Gaming Analysis
            </div>

            <div
              className={
                styles.noteText
              }
            >
              GPU /
              gaming workload /
              frame-rate balance
              を分析。
            </div>

          </div>

          <div
            className={
              styles.noteCard
            }
          >

            <div
              className={
                styles.noteTitle
              }
            >
              ⚡ AI Recommendation
            </div>

            <div
              className={
                styles.noteText
              }
            >
              semantic recommendation /
              workload optimization /
              balance analysis
              を実施。
            </div>

          </div>

        </div>

      </div>

    </section>
  )
}