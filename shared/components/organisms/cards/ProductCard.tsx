/* eslint-disable @next/next/no-img-element */

import Link
  from 'next/link'

import styles
  from './ProductCard.module.css'

import {
  formatPrice,
} from '@/shared/lib/utils/formatPrice'

type Props = {
  product: any
  rank?: number
}

export default function ProductCard({
  product,
  rank,
}: Props) {

  // =====================================
  // Helpers
  // =====================================

  const rawText =
    JSON.stringify(
      product
    ).toLowerCase()

  // =====================================
  // Intent Tags
  // =====================================

  const intentTags = []

  if (
    rawText.includes('gaming')
    || rawText.includes('fps')
  ) {

    intentTags.push(
      '🎮 FPS重視'
    )

  }

  if (
    rawText.includes('ai')
    || rawText.includes('stable diffusion')
  ) {

    intentTags.push(
      '🤖 AI生成向け'
    )

  }

  if (
    rawText.includes('creator')
    || rawText.includes('premiere')
    || rawText.includes('davinci')
  ) {

    intentTags.push(
      '🎬 動画編集向け'
    )

  }

  if (
    rawText.includes('cost')
    || rawText.includes('budget')
  ) {

    intentTags.push(
      '💰 コスパ重視'
    )

  }

  // fallback

  if (!intentTags.length) {

    intentTags.push(
      '⚡ 高性能モデル'
    )

  }

  // =====================================
  // Compact Compare Row
  // =====================================

  const compareSpecs = [

    product?.gpu_name,

    product?.cpu_name,

    product?.memory,

    product?.storage,

  ]
    .filter(Boolean)
    .slice(0, 4)

  // =====================================
  // Recommendation Reason
  // =====================================

  const topReason =

    product?.semantic_reasons?.[0]
    || '高FPS gaming に強い人気構成'

  // =====================================
  // Trust
  // =====================================

  const trustItems = [

    '初心者人気',

    'AI対応',

  ]

  return (

    <article
      className={
        styles.card
      }
    >

      {/* ================================
      TOP
      ================================ */}

      <div
        className={
          styles.top
        }
      >

        {/* ==============================
        RANK
        ============================== */}

        {rank && (

          <div
            className={
              styles.rank
            }
          >
            #{rank}
          </div>

        )}

        {/* ==============================
        INTENT
        ============================== */}

        <div
          className={
            styles.intentRow
          }
        >

          {intentTags
            .slice(0, 2)
            .map((tag) => (

              <div
                key={tag}

                className={
                  styles.intentTag
                }
              >
                {tag}
              </div>

            ))}

        </div>

      </div>

      {/* ================================
      HERO AREA
      ================================ */}

      <div
        className={
          styles.heroArea
        }
      >

        {/* ==============================
        IMAGE
        ============================== */}

        <div
          className={
            styles.imageWrap
          }
        >

          <img
            src={
              product?.image_url
            }

            alt={
              product?.name
            }

            className={
              styles.image
            }
          />

        </div>

        {/* ==============================
        CONTENT
        ============================== */}

        <div
          className={
            styles.content
          }
        >

          {/* ============================
          MAKER
          ============================ */}

          <div
            className={
              styles.maker
            }
          >
            {product?.maker || 'GALLERIA'}
          </div>

          {/* ============================
          TITLE
          ============================ */}

          <h3
            className={
              styles.title
            }
          >
            {product?.name}
          </h3>

        </div>

      </div>

      {/* ================================
      COMPACT COMPARE ROW
      ================================ */}

      <div
        className={
          styles.compareRow
        }
      >

        {compareSpecs.map((spec) => (

          <div
            key={spec}

            className={
              styles.compareChip
            }
          >
            {spec}
          </div>

        ))}

      </div>

      {/* ================================
      TOP REASON
      ================================ */}

      <div
        className={
          styles.reason
        }
      >
        ✓ {topReason}
      </div>

      {/* ================================
      TRUST LAYER
      ================================ */}

      <div
        className={
          styles.trustRow
        }
      >

        {trustItems.map((item) => (

          <div
            key={item}

            className={
              styles.trustItem
            }
          >
            {item}
          </div>

        ))}

      </div>
   

    {/* ================================
      BOTTOM
      ================================ */}

      <div
        className={
          styles.bottom
        }
      >

        {/* ==============================
        PRICE
        ============================== */}

        <div
          className={
            styles.priceArea
          }
        >

          <div
            className={
              styles.priceLabel
            }
          >
            最安価格
          </div>

          <div
            className={
              styles.price
            }
          >
            ¥{formatPrice(
              product?.price
            )}
          </div>

        </div>

        {/* ==============================
        CTA
        comparison continuation layer
        ============================== */}

        <div
          className={
            styles.ctaRow
          }
        >

          {/* ============================
          DETAIL
          decision reinforcement
          ============================ */}

          <Link
            href={
              `/product/${product?.unique_id}`
            }

            className={
              styles.primaryButton
            }
          >
            詳細を見る
          </Link>

          {/* ============================
          PRICE
          affiliate continuation
          ============================ */}

          <Link
            href={
              product?.affiliate_url
              || `/products/${product?.unique_id}`
            }

            className={
              styles.secondaryButton
            }
          >
            価格を見る
          </Link>

        </div>

      </div>



    </article>

  )
}