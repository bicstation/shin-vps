/* eslint-disable @next/next/no-img-element */

import Link
  from 'next/link'

import styles
  from './HeroRankingCard.module.css'

import {
  formatPrice,
} from '@/shared/lib/utils/formatPrice'

type Props = {
  product: any
}

export default function HeroRankingCard({
  product,
}: Props) {

  // =====================================
  // Compact Semantic Specs
  // =====================================

  const compactSpecs = [

    product?.gpu_name,

    product?.cpu_name,

    product?.memory,

    product?.storage,

  ].filter(Boolean)

  // =====================================
  // Intent Tags
  // =====================================

  const intentTags = [

    '🎮 FPS特化',

    '⚡ AI生成向け',

    '🎬 動画編集対応',

  ]

  // =====================================
  // Top Reason
  // =====================================

  const topReason =

    product?.semantic_reasons?.[0]
    || 'FPS性能が非常に高い'

  return (

    <article
      className={
        styles.card
      }
    >

      {/* ================================
      TOP BAR
      ================================ */}

      <div
        className={
          styles.topBar
        }
      >

        <div
          className={
            styles.rankBadge
          }
        >
          #{product?.ranking || 1}
        </div>

        <div
          className={
            styles.scoreBadge
          }
        >
          ★★★★★ 92%
        </div>

      </div>

      {/* ================================
      INTENT TAGS
      ================================ */}

      <div
        className={
          styles.intentRow
        }
      >

        {intentTags.map((tag) => (

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

          {/* ============================
          TOP REASON
          ============================ */}

          <div
            className={
              styles.reason
            }
          >
            ✓ {topReason}
          </div>

          {/* ============================
          COMPACT SPEC ROW
          ============================ */}

          <div
            className={
              styles.specRow
            }
          >

            {compactSpecs.map((spec) => (

              <div
                key={spec}

                className={
                  styles.specChip
                }
              >
                {spec}
              </div>

            ))}

          </div>

          {/* ============================
          TRUST ROW
          ============================ */}

          <div
            className={
              styles.trustRow
            }
          >

            <div
              className={
                styles.trustItem
              }
            >
              初心者人気
            </div>

            <div
              className={
                styles.trustItem
              }
            >
              AI用途対応
            </div>

          </div>

          {/* ============================
          BOTTOM
          ============================ */}

          <div
            className={
              styles.bottom
            }
          >

            {/* ==========================
            PRICE
            ========================== */}

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

            {/* ==========================
            CTA
            ========================== */}

            <div
              className={
                styles.ctaRow
              }
            >

              <Link
                href={
                  `/products/${product?.unique_id}`
                }

                className={
                  styles.primaryButton
                }
              >
                価格を見る
              </Link>

              <button
                className={
                  styles.secondaryButton
                }
              >
                比較する
              </button>

            </div>

          </div>

        </div>

      </div>

    </article>

  )
}