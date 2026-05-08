// next-bicstation/app/product/[unique_id]/components/spec/ProductCompactSpec.tsx

import styles
  from './spec.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildCompactSpecs(
  product: any
) {

  const specs = []

  /* ======================================
  GPU
  ====================================== */

  if (
    product?.gpu_name
  ) {

    specs.push({
      label: 'GPU',
      value: product.gpu_name,
    })

  }

  /* ======================================
  CPU
  ====================================== */

  if (
    product?.cpu_name
  ) {

    specs.push({
      label: 'CPU',
      value: product.cpu_name,
    })

  }

  /* ======================================
  MEMORY
  ====================================== */

  if (
    product?.memory
  ) {

    specs.push({
      label: 'MEMORY',
      value: product.memory,
    })

  }

  /* ======================================
  STORAGE
  ====================================== */

  if (
    product?.storage
  ) {

    specs.push({
      label: 'SSD',
      value: product.storage,
    })

  }

  return specs.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductCompactSpec({
  product,
}: Props) {

  const specs =
    buildCompactSpecs(
      product
    )

  if (
    !specs.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.compactSpecSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.compactSpecHeader
        }
      >

        <div
          className={
            styles.compactSpecLabel
          }
        >
          QUICK SPECS
        </div>

        <h2
          className={
            styles.compactSpecTitle
          }
        >
          主要スペック
        </h2>

        <p
          className={
            styles.compactSpecDescription
          }
        >
          比較しやすいよう、
          重要スペックだけを
          コンパクトに整理しています。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.compactSpecGrid
        }
      >

        {specs.map(
          (spec) => (

            <div
              key={
                spec.label
              }

              className={
                styles.compactSpecCard
              }
            >

              <div
                className={
                  styles.compactSpecCardLabel
                }
              >
                {spec.label}
              </div>

              <div
                className={
                  styles.compactSpecCardValue
                }
              >
                {spec.value}
              </div>

            </div>

          )
        )}

      </div>

      {/* ==================================
      FOOTER
      ================================== */}

      <div
        className={
          styles.compactSpecFooter
        }
      >

        <div
          className={
            styles.compactSpecFooterText
          }
        >
          ✔ gaming・AI・クリエイティブ用途で
          重要な主要構成を表示しています。
        </div>

      </div>

    </section>

  )
}