// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/ProductSpec.tsx
// ============================================================================

import styles from './spec.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildSpecs(product: any) {

  const specs = []

  /* ======================================
  MAKER
  ====================================== */

  const maker =
    product?.maker
    || product?.makerName
    || product?.maker_name

  if (maker) {

    specs.push({
      label: 'MAKER',
      value: maker,
    })

  }

  /* ======================================
  BRAND
  ====================================== */

  if (product?.brand) {

    specs.push({
      label: 'BRAND',
      value: product.brand,
    })

  }

  /* ======================================
  SERIES
  ====================================== */

  if (product?.series) {

    specs.push({
      label: 'SERIES',
      value: product.series,
    })

  }

  /* ======================================
  COLLABORATION
  ====================================== */

  if (product?.collaboration) {

    specs.push({
      label: 'COLLABORATION',
      value: product.collaboration,
    })

  }

  /* ======================================
  CPU
  ====================================== */

  const cpu =
    product?.cpuModel
    || product?.cpu_model

  if (cpu) {

    specs.push({
      label: 'CPU',
      value: cpu,
    })

  }

  /* ======================================
  GPU
  ====================================== */

  const gpu =
    product?.gpuModel
    || product?.gpu_model

  if (gpu) {

    specs.push({
      label: 'GPU',
      value: gpu,
    })

  }

  /* ======================================
  MEMORY
  ====================================== */

  if (
    product?.memoryGb != null
  ) {

    specs.push({
      label: 'MEMORY',
      value:
        `${product.memoryGb}GB`,
    })

  } else if (
    product?.memory_gb != null
  ) {

    specs.push({
      label: 'MEMORY',
      value:
        `${product.memory_gb}GB`,
    })

  }

  /* ======================================
  STORAGE
  ====================================== */

  if (
    product?.storageGb != null
  ) {

    specs.push({
      label: 'STORAGE',
      value:
        `${product.storageGb}GB`,
    })

  } else if (
    product?.storage_gb != null
  ) {

    specs.push({
      label: 'STORAGE',
      value:
        `${product.storage_gb}GB`,
    })

  }

  /* ======================================
  DISPLAY
  ====================================== */

  const display =
    product?.displayInfo
    || product?.display_info

  if (display) {

    specs.push({
      label: 'DISPLAY',
      value: display,
    })

  }

  /* ======================================
  PRICE
  ====================================== */

  if (
    product?.price != null
  ) {

    specs.push({
      label: 'PRICE',
      value:
        `¥${Number(
          product.price
        ).toLocaleString()}`,
    })

  }

  return specs

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductSpec({
  product,
}: Props) {

  if (!product) {
    return null
  }

  const specs =
    buildSpecs(product)

  const productName =
    product?.name
    || 'このPC'

  return (

    <section
      className={
        styles.specSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.specHeader
        }
      >

        <div
          className={
            styles.specLabel
          }
        >
          FULL SPECIFICATIONS
        </div>

        <h2
          className={
            styles.specTitle
          }
        >
          詳細スペック
        </h2>

        <p
          className={
            styles.specDescription
          }
        >
          {productName}
          の主要構成と製品情報を確認できます。
        </p>

      </div>

      {/* ==================================
      SPEC GRID
      ================================== */}

      <div
        className={
          styles.specGrid
        }
      >

        {

          specs.map(
            (spec) => (

              <div
                key={
                  spec.label
                }
                className={
                  styles.specCard
                }
              >

                <div
                  className={
                    styles.specCardLabel
                  }
                >
                  {spec.label}
                </div>

                <div
                  className={
                    styles.specCardValue
                  }
                >
                  {spec.value}
                </div>

              </div>

            )
          )

        }

      </div>

      {/* ==================================
      FOOTER
      ================================== */}

      <div
        className={
          styles.specFooter
        }
      >
        {productName}
        の主要構成と基本情報をまとめて確認できます。
      </div>

    </section>

  )

}