// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/components/hero/ProductHero.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import styles
  from './hero.module.css'

type Props = {
  product: any
}

export default function ProductHero({
  product,
}: Props) {

  // ==========================================================================
  // VALUES
  // ==========================================================================

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

  // ==========================================================================
  // SEMANTIC CHIPS
  // ==========================================================================

  const groupedAttributes =
    product?.grouped_attributes
    || {}

  const semanticChips = [

    ...(groupedAttributes?.usage || []),
    ...(groupedAttributes?.gpu || []),
    ...(groupedAttributes?.cpu || []),

  ].slice(0, 8)

  // ==========================================================================
  // CLEAN SUMMARY
  // ==========================================================================

  const summary =
    product?.ai_summary
      ?.replace(/\[SUMMARY_DATA\]/g, '')
      ?.trim()

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (

    <section
      className={
        styles.productHero
      }
    >

      {/* ================================================================
      TOP
      ================================================================ */}

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
                  chip: any,
                  index: number
                ) => (

                  <div
                    key={index}

                    className={
                      styles.productHeroTag
                    }
                  >

                    {
                      chip?.label
                      || chip?.name
                      || chip
                    }

                  </div>

                )
              )
          }

        </div>

         {/* ========================================================
          TITLE
          ======================================================== */}

          <h1
            className={
              styles.productHeroTitle
            }
          >

            {title}

          </h1>

      </div>

      {/* ================================================================
      MAIN
      ================================================================ */}

      <div
        className={
          styles.productHeroMain
        }
      >

        {/* ============================================================
        IMAGE
        ============================================================ */}

        <div
          className={
            styles.productHeroImageArea
          }
        >

          {
            image && (

              <img
                src={image}
                alt={title}

                className={
                  styles.productHeroImage
                }
              />

            )
          }

        </div>

        {/* ============================================================
        CONTENT
        ============================================================ */}

        <div
          className={
            styles.productHeroContent
          }
        >

          {/* ========================================================
          LABEL
          ======================================================== */}

          <div
            className={
              styles.productHeroLabel
            }
          >

            SEMANTIC PRODUCT RUNTIME

          </div>

          {/* ========================================================
          DESCRIPTION
          ======================================================== */}

          {/* {
            summary && (

              <div
                className={
                  styles.productHeroDescription
                }
              >

                {summary}

              </div>

            )
          } */}

          {/* ========================================================
          CAPABILITIES
          ======================================================== */}

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
                      chip: any,
                      index: number
                    ) => (

                      <div
                        key={index}

                        className={
                          styles.productHeroCapability
                        }
                      >

                        ✓ {
                          chip?.label
                          || chip?.name
                          || chip
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

      {/* ================================================================
      BOTTOM
      ================================================================ */}

      <div
        className={
          styles.productHeroBottom
        }
      >

        {/* ============================================================
        PRICE
        ============================================================ */}

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
            {Number(price)
              .toLocaleString()}

          </div>

        </div>

        {/* ============================================================
        ACTIONS
        ============================================================ */}

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

            近い用途のPCを見る

          </Link>

        </div>

      </div>

    </section>

  )
}