// ============================================================================
// FILE:
// app/product/[unique_id]/sections/ProductEvaluationSection.tsx
//
// SHIN CORE LINX
// Product Evaluation Experience
//
// RESPONSIBILITY
//
// ProjectedProduct
//      ↓
// ProductEvaluationSection
//      ↓
// Product Decision Experience
//
// ✓ Target User
// ✓ Strengths
// ✓ Weaknesses
// ✓ Usage Tags
//
// ✗ Semantic generation
// ✗ AI inference
// ✗ Recommendation generation
// ✗ Runtime generation
//
// Authority
//
// Backend / Adapter
//        ↓
// ProjectedProduct
//        ↓
// Experience Rendering
//
// ============================================================================

/* ============================================================================
🔥 Components
============================================================================ */

import styles
  from './ProductEvaluationSection.module.css'


/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,

} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

}


/* ============================================================================
🔥 Helpers
============================================================================ */

/**
 * Normalize a product field into a displayable string list.
 *
 * No meaning is generated here.
 */

function normalizeList(
  value:
    unknown
): string[] {

  if (
    Array.isArray(
      value
    )
  ) {

    return (

      value

        .filter(
          (
            item
          ): item is string | number =>

            typeof item === 'string'
            ||
            typeof item === 'number'

        )

        .map(
          item =>
            String(
              item
            ).trim()
        )

        .filter(Boolean)

    )

  }

  if (
    typeof value !== 'string'
    ||
    !value.trim()
  ) {

    return []

  }

  const text =
    value.trim()

  try {

    const parsed =
      JSON.parse(
        text
      )

    if (
      Array.isArray(
        parsed
      )
    ) {

      return (

        parsed

          .filter(
            (
              item
            ): item is string | number =>

              typeof item === 'string'
              ||
              typeof item === 'number'

          )

          .map(
            item =>
              String(
                item
              ).trim()
          )

          .filter(Boolean)

      )

    }

  } catch {

    // 通常文字列として処理

  }

  return (

    text

      .split(
        /\n|、|，|,/
      )

      .map(
        item =>
          item.trim()
      )

      .filter(Boolean)

  )

}


/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductEvaluationSection({

  product,

}: Props) {

  /* ==========================================================================
     Guard
     ========================================================================== */

  if (
    !product
  ) {

    return null

  }


  /* ==========================================================================
     Product Identity
     ========================================================================== */

  const productName =

    product.name
    ||
    'このPC'


  /* ==========================================================================
     Target User
     ========================================================================== */

  const targetUser =

    (
      product as any
    ).targetUser

    ||

    (
      product as any
    ).target_user

    ||

    ''


  /* ==========================================================================
     Strengths
     ========================================================================== */

  const strengths =

    normalizeList(

      (
        product as any
      ).strengths

    )


  /* ==========================================================================
     Weaknesses
     ========================================================================== */

  const weaknesses =

    normalizeList(

      (
        product as any
      ).weaknesses

    )


  /* ==========================================================================
     Usage
     ========================================================================== */

  const usageTags =

    normalizeList(

      (
        product as any
      ).usageTags

      ||

      (
        product as any
      ).usage_tags

    )


  /* ==========================================================================
     Empty Guard
     ========================================================================== */

  const hasContent =

    Boolean(
      targetUser
    )

    ||

    strengths.length > 0

    ||

    weaknesses.length > 0

    ||

    usageTags.length > 0


  if (
    !hasContent
  ) {

    return null

  }


  /* ==========================================================================
     Render
     ========================================================================== */

  return (

    <section
      className={
        styles.evaluationSection
      }

      aria-labelledby={
        'product-evaluation-title'
      }
    >

      {/* ======================================================================
      HEADER
      ====================================================================== */}

      <div
        className={
          styles.evaluationHeader
        }
      >

        <div
          className={
            styles.evaluationLabel
          }
        >

          PRODUCT EVALUATION

        </div>


        <h2
          id={
            'product-evaluation-title'
          }

          className={
            styles.evaluationTitle
          }
        >

          {productName}
          を選ぶ前に確認したいこと

        </h2>


        <p
          className={
            styles.evaluationDescription
          }
        >

          このPCがどのような方に向いているのか、
          強みや注意点を整理しています。

        </p>

      </div>


      {/* ======================================================================
      TARGET USER
      ====================================================================== */}

      {
        targetUser
        &&
        (

          <section
            className={
              styles.evaluationGroup
            }
          >

            <div
              className={
                styles.evaluationGroupHeader
              }
            >

              <div
                className={
                  styles.evaluationGroupLabel
                }
              >

                TARGET USER

              </div>

              <h3
                className={
                  styles.evaluationGroupTitle
                }
              >

                こんな方に向いています

              </h3>

            </div>


            <div
              className={
                styles.targetUserCard
              }
            >

              <p
                className={
                  styles.targetUserText
                }
              >

                {
                  targetUser
                }

              </p>

            </div>

          </section>

        )
      }


      {/* ======================================================================
      STRENGTHS
      ====================================================================== */}

      {
        strengths.length > 0
        &&
        (

          <section
            className={
              styles.evaluationGroup
            }
          >

            <div
              className={
                styles.evaluationGroupHeader
              }
            >

              <div
                className={
                  styles.evaluationGroupLabel
                }
              >

                STRENGTHS

              </div>

              <h3
                className={
                  styles.evaluationGroupTitle
                }
              >

                このPCの強み

              </h3>

            </div>


            <div
              className={
                styles.evaluationGrid
              }
            >

              {
                strengths.map(
                  (
                    strength,
                    index
                  ) => (

                    <article
                      key={
                        `${strength}-${index}`
                      }

                      className={
                        styles.strengthCard
                      }
                    >

                      <div
                        className={
                          styles.cardNumber
                        }
                      >

                        {
                          String(
                            index + 1
                          ).padStart(
                            2,
                            '0'
                          )
                        }

                      </div>


                      <p
                        className={
                          styles.cardText
                        }
                      >

                        {
                          strength
                        }

                      </p>

                    </article>

                  )
                )
              }

            </div>

          </section>

        )
      }


      {/* ======================================================================
      WEAKNESSES
      ====================================================================== */}

      {
        weaknesses.length > 0
        &&
        (

          <section
            className={
              styles.evaluationGroup
            }
          >

            <div
              className={
                styles.evaluationGroupHeader
              }
            >

              <div
                className={
                  styles.evaluationGroupLabel
                }
              >

                CONSIDERATIONS

              </div>

              <h3
                className={
                  styles.evaluationGroupTitle
                }
              >

                注意したいポイント

              </h3>

            </div>


            <div
              className={
                styles.evaluationGrid
              }
            >

              {
                weaknesses.map(
                  (
                    weakness,
                    index
                  ) => (

                    <article
                      key={
                        `${weakness}-${index}`
                      }

                      className={
                        styles.weaknessCard
                      }
                    >

                      <div
                        className={
                          styles.cardNumber
                        }
                      >

                        {
                          String(
                            index + 1
                          ).padStart(
                            2,
                            '0'
                          )
                        }

                      </div>


                      <p
                        className={
                          styles.cardText
                        }
                      >

                        {
                          weakness
                        }

                      </p>

                    </article>

                  )
                )
              }

            </div>

          </section>

        )
      }


      {/* ======================================================================
      USAGE
      ====================================================================== */}

      {
        usageTags.length > 0
        &&
        (

          <section
            className={
              styles.evaluationGroup
            }
          >

            <div
              className={
                styles.evaluationGroupHeader
              }
            >

              <div
                className={
                  styles.evaluationGroupLabel
                }
              >

                USAGE

              </div>

              <h3
                className={
                  styles.evaluationGroupTitle
                }
              >

                想定される利用シーン

              </h3>

            </div>


            <div
              className={
                styles.usageTags
              }
            >

              {
                usageTags.map(
                  (
                    tag,
                    index
                  ) => (

                    <span
                      key={
                        `${tag}-${index}`
                      }

                      className={
                        styles.usageTag
                      }
                    >

                      {
                        tag
                      }

                    </span>

                  )
                )
              }

            </div>

          </section>

        )
      }

    </section>

  )

}