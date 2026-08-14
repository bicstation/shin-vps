// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/ProductCompactSpec.tsx
// ============================================================================

import styles from './spec.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildCompactSpecs(product: any) {

  const specs = []

  const gpu =
    product?.gpuModel
    || product?.gpu_model
    || product?.gpu_name

  const cpu =
    product?.cpuModel
    || product?.cpu_model
    || product?.cpu_name

  const memory =
    product?.memoryGb != null
      ? `${product.memoryGb}GB`
      : product?.memory_gb != null
        ? `${product.memory_gb}GB`
        : product?.memory

  const storage =
    product?.storageGb != null
      ? `${product.storageGb}GB`
      : product?.storage_gb != null
        ? `${product.storage_gb}GB`
        : product?.storage

  if (cpu) {
    specs.push({
      label: 'CPU',
      value: cpu,
    })
  }

  if (gpu) {
    specs.push({
      label: 'GPU',
      value: gpu,
    })
  }

  if (memory) {
    specs.push({
      label: 'MEMORY',
      value: memory,
    })
  }

  if (storage) {
    specs.push({
      label: 'SSD',
      value: storage,
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

  if (!product) {
    return null
  }

  const specs =
    buildCompactSpecs(product)

  if (!specs.length) {
    return null
  }

  return (

    <section
      className={
        styles.compactSpecSection
      }
    >

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
          比較しやすいよう、重要スペックだけを
          コンパクトに整理しています。
        </p>

      </div>

      <div
        className={
          styles.compactSpecGrid
        }
      >

        {specs.map(
          (spec) => (

            <div
              key={spec.label}
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
          ✔ CPU・GPU・メモリー・ストレージの
          主要構成を表示しています。
        </div>

      </div>

    </section>

  )
}