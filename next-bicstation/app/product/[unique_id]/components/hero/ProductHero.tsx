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
🔥 Projection Types
============================================================================ */

import type {

  ProjectedProduct,
  ProjectedSemanticRuntime,
  ProjectedCompiledRuntime,

} from '@/shared/lib/api/django/pc/product-detail'

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
🔥 Props
============================================================================ */

type Props = {

  product: ProjectedProduct

  semanticRuntime?: ProjectedSemanticRuntime

  compiledRuntime?: ProjectedCompiledRuntime

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductHero({

  product,

  semanticRuntime,

  compiledRuntime,

}: Props) {

  const title =
    product.name || 'PRODUCT'

  const image =
    product.imageUrl

  const maker =
    product.maker || 'UNKNOWN'

  const price =
    product.price

  const semanticSummary =
    semanticRuntime?.semanticSummary || ''

  const workflowTags =
    semanticRuntime?.workflowTags || []

  // 将来利用予定
  void compiledRuntime

  const targetUser =
    (product as any)?.target_user

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

          {/* ======================================================
          TARGET USER
          ====================================================== */}

          {

            targetUser && (

              <div
                className={
                  styles.productHeroTargetUser
                }
              >

                <div
                  className={
                    styles.productHeroMiniLabel
                  }
                >
                  FOR WHO
                </div>

                <p
                  className={
                    styles.productHeroTargetUserText
                  }
                >
                  {targetUser}
                </p>

              </div>

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