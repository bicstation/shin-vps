// ============================================================================
// FILE:
// app/product/[unique_id]/components/semantic/ProductSemanticReasons.tsx
// ============================================================================

import styles
  from './semantic.module.css'

/* =========================================
🔥 Types
========================================= */

type SemanticReason = {

  slug?: string

  title?: string

  description?: string

  role?: string

  weight?: number

}

type Props = {

  semanticRuntime?: {

    semantic_reasons?: SemanticReason[]

  }

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductSemanticReasons({

  semanticRuntime,

}: Props) {

  const reasons =

    semanticRuntime
      ?.semantic_reasons
      || []

  if (
    reasons.length === 0
  ) {

    return null

  }

  return (

    <section
      className={
        styles.semanticReasonsSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.semanticReasonsHeader
        }
      >

        <div
          className={
            styles.semanticReasonsLabel
          }
        >
          SEMANTIC REASONS
        </div>

        <h2
          className={
            styles.semanticReasonsTitle
          }
        >
          このPCが提案される理由
        </h2>

        <p
          className={
            styles.semanticReasonsDescription
          }
        >
          Backend Semantic Authority が
          判定した意味情報を表示しています。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.semanticReasonsGrid
        }
      >

        {reasons.map(
          (
            reason,
            index
          ) => (

            <div
              key={
                `${reason.slug || 'reason'}-${index}`
              }

              className={
                styles.semanticReasonsCard
              }
            >

              <div
                className={
                  styles.semanticReasonsContent
                }
              >

                <div
                  className={
                    styles.semanticReasonsCardTitle
                  }
                >
                  {
                    reason.title
                    || reason.slug
                    || 'Semantic Reason'
                  }
                </div>

                {

                  reason.description && (

                    <p
                      className={
                        styles.semanticReasonsCardDescription
                      }
                    >
                      {reason.description}
                    </p>

                  )

                }

                {

                  reason.role && (

                    <p
                      className={
                        styles.semanticReasonsCardDescription
                      }
                    >
                      Role:
                      {' '}
                      {reason.role}
                    </p>

                  )

                }

                {

                  typeof reason.weight === 'number' && (

                    <p
                      className={
                        styles.semanticReasonsCardDescription
                      }
                    >
                      Weight:
                      {' '}
                      {reason.weight}
                    </p>

                  )

                }

              </div>

            </div>

          )
        )}

      </div>

      {/* ==================================
      FOOTER
      ================================== */}

      <div
        className={
          styles.semanticReasonsFooter
        }
      >

        <div
          className={
            styles.semanticReasonsFooterText
          }
        >
          ✔ Backend Semantic Authority Runtime
          に基づく判定理由です
        </div>

      </div>

    </section>

  )

}