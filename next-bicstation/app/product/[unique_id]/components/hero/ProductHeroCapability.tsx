// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductHeroCapability.tsx
// ============================================================================

import styles
  from './styles/ProductHeroCapability.module.css'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedSemanticRuntime,
  ProjectedCompiledRuntime,

} from '@/shared/lib/api/django/pc/product-detail'

/* ============================================================================
🔥 Types
============================================================================ */

type SemanticReason = {

  slug?: string

  title?: string

  description?: string

  role?: string

}

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  semanticRuntime?: ProjectedSemanticRuntime

  compiledRuntime?: ProjectedCompiledRuntime

}

/* ============================================================================
🔥 Workflow Labels
============================================================================ */

function getWorkflowLabel(
  tag: string
): string {

  const labels:
    Record<string, string> = {

    'usage-ai':
      'AI開発・生成AI',

    'usage-gaming':
      'FPS・ゲームプレイ',

    'usage-creator':
      '動画編集・制作',

    'usage-business':
      'ビジネス用途',

    'usage-mobile':
      'モバイル利用',

  }

  return (
    labels[tag]
    || tag
  )

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductHeroCapability({

  semanticRuntime,

  compiledRuntime,

}: Props) {

  // 将来利用予定
  void compiledRuntime

  const workflowTags =

    semanticRuntime
      ?.workflowTags

    ||

    []

  const semanticReasons =

    (semanticRuntime
      ?.semanticReasons as SemanticReason[])

    ||

    []

  if (

    workflowTags.length === 0

    &&

    semanticReasons.length === 0

  ) {

    return null

  }

  return (

    <section
      className={
        styles.heroCapabilitySection
      }
    >

      {/* ==========================================================
      WORKFLOW
      ========================================================== */}

      {

        workflowTags.length > 0 && (

          <>

            <div
              className={
                styles.heroCapabilityHeader
              }
            >

              <div
                className={
                  styles.heroCapabilityLabel
                }
              >
                WORKFLOW EXPERIENCE
              </div>

              <h2
                className={
                  styles.heroCapabilityTitle
                }
              >
                このPCでできること
              </h2>

              <p
                className={
                  styles.heroCapabilityDescription
                }
              >
                このPCが得意とする利用シーンです。
              </p>

            </div>

            <div
              className={
                styles.heroCapabilityGrid
              }
            >

              {

                workflowTags.map(

                  (
                    tag,
                    index
                  ) => (

                    <div
                      key={index}
                      className={
                        styles.heroCapabilityCard
                      }
                    >

                      <div
                        className={
                          styles.heroCapabilityText
                        }
                      >
                        {getWorkflowLabel(tag)}
                      </div>

                    </div>

                  )

                )

              }

            </div>

          </>

        )

      }

      {/* ==========================================================
      REASONS
      ========================================================== */}

      {

        semanticReasons.length > 0 && (

          <>

            <div
              className={
                styles.heroCapabilityHeader
              }
            >

              <div
                className={
                  styles.heroCapabilityLabel
                }
              >
                WHY THIS PRODUCT
              </div>

              <h2
                className={
                  styles.heroCapabilityTitle
                }
              >
                このPCが選ばれる理由
              </h2>

              <p
                className={
                  styles.heroCapabilityDescription
                }
              >
                Semantic Runtime が判定した
                推薦根拠です。
              </p>

            </div>

            <div
              className={
                styles.heroCapabilityGrid
              }
            >

              {

                semanticReasons

                  .slice(0, 6)

                  .map(

                    (
                      reason,
                      index
                    ) => (

                      <div
                        key={index}
                        className={
                          styles.heroCapabilityCard
                        }
                      >

                        <div
                          className={
                            styles.heroCapabilityText
                          }
                        >
                          {reason.title}
                        </div>

                        {

                          reason.description && (

                            <div
                              className={
                                styles.heroCapabilitySubText
                              }
                            >
                              {reason.description}
                            </div>

                          )

                        }

                      </div>

                    )

                  )

              }

            </div>

          </>

        )

      }

    </section>

  )

}