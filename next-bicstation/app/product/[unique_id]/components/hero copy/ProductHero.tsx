// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductHero.tsx
// Semantic Runtime V3
// ============================================================================

'use client'

import Link
  from 'next/link'

import styles
  from './hero.module.css'

type Props = {
  product: any
}

/* ============================================================================
🔥 Helpers
============================================================================ */

function getSemanticRuntime(
  product: any
) {

  return (
    product?.product_semantic_runtime
    || {}
  )

}

function getHeroSubtitle(
  product: any
) {

  const runtime =
    getSemanticRuntime(
      product
    )

  return (

    runtime?.semantic_summary
    || product?.target_user
    || 'Semantic Product Runtime'

  )

}

function buildSemanticChips(
  product: any
) {

  const runtime =
    getSemanticRuntime(
      product
    )

  const labels =

    runtime?.semantic_labels
    || []

  return labels
    .slice(0, 6)
    .map(
      (
        label: any
      ) => {

        if (
          typeof label === 'string'
        ) {

          return label

        }

        return (

          label?.title
          || label?.slug
          || label?.name
          || ''

        )

      }
    )
    .filter(Boolean)

}

function buildSpecChips(
  product: any
) {

  const chips: string[] = []

  if (
    product?.gpu_model
  ) {

    chips.push(
      product.gpu_model
    )

  }

  if (
    product?.cpu_model
  ) {

    chips.push(
      product.cpu_model
    )

  }

  if (
    product?.memory_gb
  ) {

    chips.push(
      `${product.memory_gb}GB Memory`
    )

  }

  if (
    product?.storage_gb
  ) {

    const storage =

      product.storage_gb >= 1024

        ? `${Math.floor(
            product.storage_gb / 1024
          )}TB SSD`

        : `${product.storage_gb}GB SSD`

    chips.push(
      storage
    )

  }

  return chips

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductHero({

  product,

}: Props) {

  const title =

    product?.name
    || 'PRODUCT'
  
  const heroTitle =
  product?.name
    ?.split('(')[0]
    ?.trim()
  || product?.name
  || 'PRODUCT'

  const role =
    product
      ?.product_semantic_runtime
      ?.semantic_labels?.[0]
      ?.title
  || 'AI CREATIVE WORKSTATION'

  const image =

    product?.image_url

  const maker =

    product?.maker_name
    || product?.maker
    || 'UNKNOWN'

  const price =

    product?.price

  const subtitle =

    getHeroSubtitle(
      product
    )

  const semanticChips =

    buildSemanticChips(
      product
    )

  const specChips =

    buildSpecChips(
      product
    )

  return (

    <section
      className={
        styles.productHero
      }
    >
       <div
          className={
            styles.productHeroBackgroundOverlay
          }
       />

      {/* ============================================================
      TOP
      ============================================================ */}

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

      {/* ============================================================
      MAIN
      ============================================================ */}

      <div
        className={
          styles.productHeroMain
        }
      >

        {/* ========================================================
        IMAGE
        ======================================================== */}

        <div
          className={
            styles.productHeroImageArea
          }
        >

          {image && (

            <img
              src={image}
              alt={title}
              className={
                styles.productHeroImage
              }
            />

          )}

        </div>

        {/* ========================================================
        CONTENT
        ======================================================== */}

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
             {role}
          </div>

          <h1
            className={
              styles.productHeroTitle
            }
          >
            {heroTitle}
          </h1>

          <div
            className={
              styles.productHeroDescription
            }
          >
            {subtitle}
          </div>

          {/* ====================================================
          SEMANTIC CHIPS
          ==================================================== */}

          {semanticChips.length > 0 && (

            <div
              className={
                styles.productHeroCapabilities
              }
            >

              {semanticChips.map(
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
                    {chip}
                  </div>

                )
              )}

            </div>

          )}

          {/* ====================================================
          SPEC CHIPS
          ==================================================== */}

          {specChips.length > 0 && (

            <div
              className={
                styles.productHeroSpecs
              }
            >

              {specChips.map(
                (
                  chip,
                  index
                ) => (

                  <div
                    key={index}
                    className={
                      styles.productHeroSpec
                    }
                  >
                    {chip}
                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* ============================================================
      BOTTOM
      ============================================================ */}

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
            実売価格
          </div>

          <div
            className={
              styles.productHeroPrice
            }
          >

            ¥

            {Number(
              price || 0
            ).toLocaleString()}

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
            近い用途のPCを見る
          </Link>

        </div>

      </div>

    </section>

  )

}