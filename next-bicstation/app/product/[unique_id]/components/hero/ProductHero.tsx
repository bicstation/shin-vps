// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductHero.tsx
// ============================================================================

'use client'

import Link
  from 'next/link'

import styles
  from './styles/ProductHero.module.css'

type Props = {

  product: any

  semanticRuntime?: {

    semantic_summary?: string

    grouped_attributes?: Record<
      string,
      any[]
    >

  }

}

/* ============================================================================
🔥 Helpers
============================================================================ */

function getChipText(
  value: any
): string {

  if (!value) {

    return ''

  }

  if (
    typeof value === 'string'
  ) {

    return value

  }

  return (

    value.label
    || value.title
    || value.name
    || value.slug
    || ''

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
    || 'PRODUCT'

  const image =

    product?.image_url

  const maker =

    product?.maker_name
    || product?.maker
    || 'UNKNOWN'

  const price =

    product?.price

  const groupedAttributes =

    semanticRuntime
      ?.grouped_attributes

    ||

    product
      ?.grouped_attributes

    ||

    {}

  const semanticChips = [

    ...(groupedAttributes?.usage || []),

    ...(groupedAttributes?.gpu || []),

    ...(groupedAttributes?.cpu || []),

  ]
    .map(getChipText)
    .filter(Boolean)
    .slice(0, 6)

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

          {

            semanticChips
              .slice(0, 2)
              .map(
                (
                  chip,
                  index
                ) => (

                  <div
                    key={index}
                    className={
                      styles.productHeroTag
                    }
                  >
                    {chip}
                  </div>

                )
              )

          }

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
            SEMANTIC PRODUCT RUNTIME
          </div>

          <h1
            className={
              styles.productHeroTitle
            }
          >
            {title}
          </h1>

          {

            semanticChips.length > 0 && (

              <div
                className={
                  styles.productHeroCapabilities
                }
              >

                {

                  semanticChips.map(
                    (
                      chip,
                      index
                    ) => (

                      <div
                        key={index}
                        className={
                          styles.productHeroCapability
                        }
                      >
                        ✓ {chip}
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
            href="#spec"
            className={
              styles.productHeroPrimary
            }
          >
            スペックを見る
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