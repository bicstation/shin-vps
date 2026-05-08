// next-bicstation/app/product/[unique_id]/components/cta/ProductFinalCTA.tsx

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

function buildPriceText(
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

function buildCTA(
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

export default function ProductFinalCTA({
  product,
}: Props) {

  const price =
    buildPriceText(
      product
    )

  const href =
    buildCTA(
      product
    )

  return (

    <section
      className={
        styles.finalCTASection
      }
    >

      {/* ==================================
      CARD
      ================================== */}

      <div
        className={
          styles.finalCTACard
        }
      >

        {/* ==============================
        LABEL
        ============================== */}

        <div
          className={
            styles.finalCTALabel
          }
        >
          FINAL DECISION
        </div>

        {/* ==============================
        TITLE
        ============================== */}

        <h2
          className={
            styles.finalCTATitle
          }
        >
          このPCを
          最終候補としてチェックする
        </h2>

        {/* ==============================
        DESCRIPTION
        ============================== */}

        <p
          className={
            styles.finalCTADescription
          }
        >
          gaming・AI・creator用途など、
          幅広い用途で使いやすい
          バランス構成です。
        </p>

        {/* ==============================
        PRICE
        ============================== */}

        {price && (

          <div
            className={
              styles.finalCTAPrice
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
            styles.finalCTAActions
          }
        >

          <Link
            href={href}

            target="_blank"

            className={
              styles.finalCTAPrimary
            }
          >
            🔥 最新価格を見る
          </Link>

          <Link
            href="/ranking"

            className={
              styles.finalCTASecondary
            }
          >
            ⚡ 他のランキングも比較
          </Link>

        </div>

        {/* ==============================
        FOOTER
        ============================== */}

        <div
          className={
            styles.finalCTAFooter
          }
        >

          <div
            className={
              styles.finalCTAFooterText
            }
          >
            ✔ comparison・semantic analysis をもとに、
            安心して比較しやすい構成です。
          </div>

        </div>

      </div>

    </section>

  )
}