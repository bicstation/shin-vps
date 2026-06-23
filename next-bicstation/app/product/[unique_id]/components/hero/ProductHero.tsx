// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductHero.tsx
// ============================================================================

'use client'

import Link
  from 'next/link'

import styles
  from './styles/ProductHero.module.css'

/* ============================================================================
🔥 Types
============================================================================ */

type Props = {

  product: any

  semanticRuntime?: {

    semantic_summary?: string

    workflow_tags?: string[]

  }

}

/* ============================================================================
🔥 Workflow Label
============================================================================ */

function getWorkflowLabel(
  tag: string
): string {

  const labels:
    Record<string, string> = {

      'usage-ai':
        'AI',

      'usage-gaming':
        'Gaming',

      'usage-creator':
        'Creator',

      'usage-business':
        'Business',

      'usage-mobile':
        'Mobile',

    }

  return (
    labels[tag]
    || tag
  )

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductHero({

  product,

  semanticRuntime,

}: Props) {

  const title =

    product?.name

    ||

    'PRODUCT'

  const image =

    product?.image_url

  const maker =

    product?.maker

    ||

    'UNKNOWN'

  const price =

    product?.price

  const semanticSummary =

    semanticRuntime
      ?.semantic_summary

    ||

    ''

  const workflowTags =

    semanticRuntime
      ?.workflow_tags

    ||

    []

  return (

    <section
      className={
        styles.productHero
      }
    >

      {/* ==========================================================
      BACKGROUND
      ========================================================== */}

      <div
        className={
          styles.productHeroBackgroundOverlay
        }
      />

      {/* ==========================================================
      TOP
      ========================================================== */}

      <div
        className={
          styles.productHeroTop
        }
      >

        <div
          className={
            styles.productHeroTags
          }
        >

          <div
            className={
              styles.productHeroTag
            }
          >
            {maker}
          </div>

        </div>

      </div>

      {/* ==========================================================
      MAIN
      ========================================================== */}

      <div
        className={
          styles.productHeroMain
        }
      >

        {/* ======================================================
        IMAGE
        ====================================================== */}

        {

          image && (

            <div
              className={
                styles.productHeroImageArea
              }
            >

              <img
                src={image}
                alt={title}
                className={
                  styles.productHeroImage
                }
              />

            </div>

          )

        }

        {/* ======================================================
        CONTENT
        ====================================================== */}

        <div
          className={
            styles.productHeroContent
          }
        >

          <div
            className={
              styles.productHeroLabel
            }
          >
            SEMANTIC PRODUCT EXPERIENCE
          </div>

          <h1
            className={
              styles.productHeroTitle
            }
          >
            {title}
          </h1>

          {

            semanticSummary && (

              <p
                className={
                  styles.productHeroSummary
                }
              >
                {semanticSummary}
              </p>

            )

          }

          {

            workflowTags.length > 0 && (

              <div
                className={
                  styles.productHeroCapabilities
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
                          styles.productHeroCapability
                        }
                      >
                        {
                          getWorkflowLabel(
                            tag
                          )
                        }
                      </div>

                    )

                  )

                }

              </div>

            )

          }

        </div>

      </div>

      {/* ==========================================================
      BOTTOM
      ========================================================== */}

      <div
        className={
          styles.productHeroBottom
        }
      >

        <div
          className={
            styles.productHeroPriceArea
          }
        >

          <div
            className={
              styles.productHeroPriceLabel
            }
          >
            PRICE
          </div>

          <div
            className={
              styles.productHeroPrice
            }
          >

            ¥

            {

              Number(
                price || 0
              ).toLocaleString()

            }

          </div>

        </div>

        <div
          className={
            styles.productHeroActions
          }
        >

          <Link
            href="#semantic"
            className={
              styles.productHeroPrimary
            }
          >
            選ばれる理由を見る
          </Link>

          <Link
            href="#related"
            className={
              styles.productHeroSecondary
            }
          >
            関連製品を見る
          </Link>

        </div>

      </div>

    </section>

  )

}