// next-bicstation/app/product/[unique_id]/components/hero/ProductHeroTrust.tsx

import styles
  from './hero.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildTrustItems(
  product: any
) {

  const items: string[] = []

  const text = JSON.stringify(
    product
  ).toLowerCase()

  // ======================================
  // BEGINNER
  // ======================================

  items.push(
    '✔ 初心者にも人気'
  )

  // ======================================
  // LONG USE
  // ======================================

  items.push(
    '✔ 長く使いやすい'
  )

  // ======================================
  // AI
  // ======================================

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    items.push(
      '✔ AI用途でも安心'
    )

  }

  // ======================================
  // GAMING
  // ======================================

  if (
    text.includes('gaming')
    || text.includes('geforce')
  ) {

    items.push(
      '✔ 高fps gaming対応'
    )

  }

  // ======================================
  // CREATOR
  // ======================================

  if (
    text.includes('creator')
    || text.includes('premiere')
  ) {

    items.push(
      '✔ 動画編集も快適'
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

    items.push(
      '✔ コスパが良い'
    )

  }

  return items.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductHeroTrust({
  product,
}: Props) {

  const trustItems =
    buildTrustItems(
      product
    )

  return (

    <section
      className={
        styles.heroTrustSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.heroTrustHeader
        }
      >

        <div
          className={
            styles.heroTrustLabel
          }
        >
          TRUST & CONFIDENCE
        </div>

        <h2
          className={
            styles.heroTrustTitle
          }
        >
          安心して選びやすい
          人気構成
        </h2>

        <p
          className={
            styles.heroTrustDescription
          }
        >
          gaming・AI生成・動画編集など、
          幅広い用途に対応しやすい
          バランス構成です。
        </p>

      </div>

      {/* ==================================
      TRUST GRID
      ================================== */}

      <div
        className={
          styles.heroTrustGrid
        }
      >

        {trustItems.map(
          (item) => (

            <div
              key={item}

              className={
                styles.heroTrustCard
              }
            >
              {item}
            </div>

          )
        )}

      </div>

    </section>

  )
}