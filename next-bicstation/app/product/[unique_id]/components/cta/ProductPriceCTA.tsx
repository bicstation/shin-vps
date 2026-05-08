// next-bicstation/app/product/[unique_id]/components/cta/ProductPriceCTA.tsx

import Link
  from 'next/link'

import styles
  from './cta.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildPrice(
  product: any
) {

  if (
    !product?.price
  ) {
    return null
  }

  return `¥${Number(
    product.price
  ).toLocaleString()}`

}

function buildCTAUrl(
  product: any
) {

  return (
    product?.affiliate_url
    || product?.url
    || '#'
  )

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductPriceCTA({
  product,
}: Props) {

  const price =
    buildPrice(
      product
    )

  const href =
    buildCTAUrl(
      product
    )

  return (

    <section
      className={
        styles.priceCTASection
      }
    >

      {/* ==================================
      CARD
      ================================== */}

      <div
        className={
          styles.priceCTACard
        }
      >

        {/* ==============================
        LABEL
        ============================== */}

        <div
          className={
            styles.priceCTALabel
          }
        >
          PRICE CHECK
        </div>

        {/* ==============================
        TITLE
        ============================== */}

        <h2
          className={
            styles.priceCTATitle
          }
        >
          最新価格を確認する
        </h2>

        {/* ==============================
        DESCRIPTION
        ============================== */}

        <p
          className={
            styles.priceCTADescription
          }
        >
          価格・性能・用途バランスを
          比較しながら、
          最終判断しやすく整理しています。
        </p>

        {/* ==============================
        PRICE
        ============================== */}

        {price && (

          <div
            className={
              styles.priceCTAPrice
            }
          >
            {price}
          </div>

        )}

        {/* ==============================
        ACTIONS
        ============================== */}

        <div
          className={
            styles.priceCTAActions
          }
        >

          <Link
            href={href}

            target="_blank"

            className={
              styles.priceCTAPrimary
            }
          >
            🔥 このPCをチェック
          </Link>

          <Link
            href="/ranking"

            className={
              styles.priceCTASecondary
            }
          >
            ⚡ 他のランキングを見る
          </Link>

        </div>

        {/* ==============================
        FOOTER
        ============================== */}

        <div
          className={
            styles.priceCTAFooter
          }
        >

          <div
            className={
              styles.priceCTAFooterText
            }
          >
            ✔ semantic recommendation をもとに、
            用途別に比較しやすく整理しています。
          </div>

        </div>

      </div>

    </section>

  )
}