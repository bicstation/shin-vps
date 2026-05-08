// next-bicstation/app/product/[unique_id]/components/hero/ProductHero.tsx

/* eslint-disable @next/next/no-img-element */

import Link
  from 'next/link'

import styles
  from './hero.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildIntentTags(
  product: any
) {

  const tags: string[] = []

  const text = JSON.stringify(
    product
  ).toLowerCase()

  // ======================================
  // AI
  // ======================================

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    tags.push(
      '🤖 AI生成向け'
    )

  }

  // ======================================
  // GAMING
  // ======================================

  if (
    text.includes('gaming')
    || text.includes('geforce')
  ) {

    tags.push(
      '🎮 gaming向け'
    )

  }

  // ======================================
  // CREATOR
  // ======================================

  if (
    text.includes('creator')
    || text.includes('premiere')
  ) {

    tags.push(
      '🎬 動画編集向け'
    )

  }

  // ======================================
  // COST
  // ======================================

  if (
    product?.price
    && Number(product.price)
      < 250000
  ) {

    tags.push(
      '💰 コスパ重視'
    )

  }

  return tags.slice(0, 3)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductHero({
  product,
}: Props) {

  // ======================================
  // BASIC
  // ======================================

  const image =
    product?.image_url
    || product?.thumbnail_url
    || '/no-image.webp'

  const name =
    product?.name
    || 'PC Product'

  const price =
    product?.price
      ? Number(
          product.price
        ).toLocaleString()
      : null

  // ======================================
  // COMPARE
  // ======================================

  const compareSpecs = [

    product?.gpu_name,
    product?.cpu_name,
    product?.memory,
    product?.storage,

  ]
    .filter(Boolean)
    .slice(0, 4)

  // ======================================
  // INTENT
  // ======================================

  const intentTags =
    buildIntentTags(
      product
    )

  return (

    <section
      className={
        styles.productHero
      }
    >

      {/* ==================================
      TOP
      ================================== */}

      <div
        className={
          styles.productHeroTop
        }
      >

        {/* ==============================
        INTENT TAGS
        ============================== */}

        <div
          className={
            styles.productHeroTags
          }
        >

          {intentTags.map(
            (tag) => (

              <div
                key={tag}

                className={
                  styles.productHeroTag
                }
              >
                {tag}
              </div>

            )
          )}

        </div>

      </div>

      {/* ==================================
      MAIN
      ================================== */}

      <div
        className={
          styles.productHeroMain
        }
      >

        {/* ==============================
        IMAGE
        ============================== */}

        <div
          className={
            styles.productHeroImageArea
          }
        >

          <img
            src={image}

            alt={name}

            className={
              styles.productHeroImage
            }
          />

        </div>

        {/* ==============================
        CONTENT
        ============================== */}

        <div
          className={
            styles.productHeroContent
          }
        >

          {/* ============================
          LABEL
          ============================ */}

          <div
            className={
              styles.productHeroLabel
            }
          >
            SEMANTIC RECOMMENDATION
          </div>

          {/* ============================
          TITLE
          ============================ */}

          <h1
            className={
              styles.productHeroTitle
            }
          >
            {name}
          </h1>

          {/* ============================
          DESCRIPTION
          ============================ */}

          <p
            className={
              styles.productHeroDescription
            }
          >
            gaming・AI生成・動画編集など、
            幅広い用途に対応できる
            高性能PC構成です。
          </p>

          {/* ============================
          CAPABILITY
          ============================ */}

          <div
            className={
              styles.productHeroCapabilities
            }
          >

            <div
              className={
                styles.productHeroCapability
              }
            >
              ✓ 高fps gaming対応
            </div>

            <div
              className={
                styles.productHeroCapability
              }
            >
              ✓ AI画像生成対応
            </div>

            <div
              className={
                styles.productHeroCapability
              }
            >
              ✓ 動画編集OK
            </div>

          </div>

          {/* ============================
          COMPACT COMPARE
          ============================ */}

          <div
            className={
              styles.productHeroSpecs
            }
          >

            {compareSpecs.map(
              (spec) => (

                <div
                  key={spec}

                  className={
                    styles.productHeroSpec
                  }
                >
                  {spec}
                </div>

              )
            )}

          </div>

          {/* ============================
          TRUST
          ============================ */}

          <div
            className={
              styles.productHeroTrust
            }
          >

            <div
              className={
                styles.productHeroTrustItem
              }
            >
              ✔ 初心者向け
            </div>

            <div
              className={
                styles.productHeroTrustItem
              }
            >
              ✔ 長く使いやすい
            </div>

            <div
              className={
                styles.productHeroTrustItem
              }
            >
              ✔ 高性能GPU搭載
            </div>

          </div>

          {/* ============================
          BOTTOM
          ============================ */}

          <div
            className={
              styles.productHeroBottom
            }
          >

            {/* ==========================
            PRICE
            ========================== */}

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
                最安価格
              </div>

              <div
                className={
                  styles.productHeroPrice
                }
              >
                {price
                  ? `¥${price}`
                  : '価格未設定'}
              </div>

            </div>

            {/* ==========================
            CTA
            ========================== */}

            <div
              className={
                styles.productHeroActions
              }
            >

              <Link
                href={
                  product?.affiliate_url
                  || '#'
                }

                className={
                  styles.productHeroPrimary
                }
              >
                最安価格を見る
              </Link>

              <Link
                href="/ranking"

                className={
                  styles.productHeroSecondary
                }
              >
                比較を続ける
              </Link>

            </div>

          </div>

        </div>

      </div>

    </section>

  )
}