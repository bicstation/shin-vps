// RecommendationSection.tsx
'use client'

/* =========================================
🔥 Next
========================================= */

import Link
  from 'next/link'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './RecommendationSection.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  purpose: string

  semanticUsage: string

  featuredProduct?: any
}

/* =========================================
🔥 Purpose Message
========================================= */

function getPurposeMessage(
  purpose: string
) {

  switch (
    purpose
  ) {

    case 'gaming':
      return `
        高FPS・重量級ゲーム・
        長時間プレイに適した
        gaming semantic 構成。
      `

    case 'creator':
      return `
        動画編集・配信・
        creative workload に
        最適化された構成。
      `

    case 'business':
      return `
        安定性・コスパ・
        長期運用を重視した
        business semantic。
      `

    case 'ai':
      return `
        AI画像生成・LLM・
        GPU workload に
        最適化された構成。
      `

    default:
      return `
        semantic recommendation
        に基づく推奨構成。
      `
  }
}

/* =========================================
🔥 Recommendation Section
========================================= */

export default function
RecommendationSection({

  purpose,

  semanticUsage,

  featuredProduct,

}: Props) {

  // ======================================
  // Message
  // ======================================

  const message =

    getPurposeMessage(
      purpose
    )

  // ======================================
  // Safe
  // ======================================

  if (
    !featuredProduct
  ) {

    return null

  }

  // ======================================
  // Basic
  // ======================================

  const title =

    featuredProduct?.name
    || 'おすすめPC'

  const maker =

    featuredProduct?.maker
    || 'Recommended'

  const image =

    featuredProduct?.image_url
    || '/no-image.png'

  const price =

    typeof
      featuredProduct?.price
      === 'number'

      ? `¥${featuredProduct.price.toLocaleString()}`

      : null

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 RecommendationSection',
    {

      purpose,

      semanticUsage,

      title,

      maker,

    }
  )

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.section
      }
    >

      {/* ==================================
      Glow
      ================================== */}

      <div
        className={
          styles.glow
        }
      />

      {/* ==================================
      Layout
      ================================== */}

      <div
        className={
          styles.layout
        }
      >

        {/* =================================
        LEFT
        ================================= */}

        <div
          className={
            styles.content
          }
        >

          {/* ============================= */}
          {/* Label */}
          {/* ============================= */}

          <div
            className={
              styles.label
            }
          >

            AI RECOMMENDATION

          </div>

          {/* ============================= */}
          {/* Title */}
          {/* ============================= */}

          <h2
            className={
              styles.title
            }
          >

            この用途におすすめの構成

          </h2>

          {/* ============================= */}
          {/* Description */}
          {/* ============================= */}

          <p
            className={
              styles.description
            }
          >

            {message}

          </p>

          {/* ============================= */}
          {/* Semantic */}
          {/* ============================= */}

          <div
            className={
              styles.semanticBox
            }
          >

            <div
              className={
                styles.semanticLabel
              }
            >

              ACTIVE SEMANTIC

            </div>

            <div
              className={
                styles.semanticValue
              }
            >

              {semanticUsage}

            </div>

          </div>

          {/* ============================= */}
          {/* CTA */}
          {/* ============================= */}

          <div
            className={
              styles.actions
            }
          >

            <Link

              href={
                `/product/${featuredProduct.unique_id}`
              }

              className={
                styles.primaryButton
              }
            >

              👉 詳細を見る

            </Link>

            <Link

              href={
                `/ranking/${semanticUsage}`
              }

              className={
                styles.secondaryButton
              }
            >

              ランキングを見る

            </Link>

          </div>

        </div>

        {/* =================================
        RIGHT
        ================================= */}

        <div
          className={
            styles.card
          }
        >

          {/* ============================= */}
          {/* Image */}
          {/* ============================= */}

          <div
            className={
              styles.imageWrap
            }
          >

            <img

              src={image}

              alt={title}

              className={
                styles.image
              }

            />

          </div>

          {/* ============================= */}
          {/* Info */}
          {/* ============================= */}

          <div
            className={
              styles.cardContent
            }
          >

            <div
              className={
                styles.maker
              }
            >

              {maker}

            </div>

            <h3
              className={
                styles.productTitle
              }
            >

              {title}

            </h3>

            {price && (

              <div
                className={
                  styles.price
                }
              >

                {price}

              </div>

            )}

          </div>

        </div>

      </div>

    </section>

  )
}