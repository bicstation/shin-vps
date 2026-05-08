// next-bicstation/app/product/[unique_id]/components/capability/ProductPerformanceHighlights.tsx

import styles
  from './capability.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildHighlights(
  product: any
) {

  const highlights = []

  const text = JSON.stringify(
    product
  ).toLowerCase()

  // ======================================
  // GPU
  // ======================================

  if (
    product?.gpu_name
  ) {

    highlights.push({
      label: 'GPU',
      value: product.gpu_name,
      description:
        'gaming・AI処理・動画編集性能に大きく影響します。',
    })

  }

  // ======================================
  // CPU
  // ======================================

  if (
    product?.cpu_name
  ) {

    highlights.push({
      label: 'CPU',
      value: product.cpu_name,
      description:
        '配信・マルチタスク・作業性能を支える重要パーツです。',
    })

  }

  // ======================================
  // MEMORY
  // ======================================

  if (
    product?.memory
  ) {

    highlights.push({
      label: 'MEMORY',
      value: product.memory,
      description:
        'ゲームしながら配信など、同時作業の快適性に関係します。',
    })

  }

  // ======================================
  // STORAGE
  // ======================================

  if (
    product?.storage
  ) {

    highlights.push({
      label: 'SSD',
      value: product.storage,
      description:
        '起動速度やゲームロード時間に影響する重要要素です。',
    })

  }

  // ======================================
  // AI
  // ======================================

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    highlights.push({
      label: 'AI READY',
      value: '対応',
      description:
        'AI画像生成・推論用途でも活用しやすい構成です。',
    })

  }

  return highlights.slice(0, 5)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductPerformanceHighlights({
  product,
}: Props) {

  const highlights =
    buildHighlights(
      product
    )

  if (
    !highlights.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.performanceSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.performanceHeader
        }
      >

        <div
          className={
            styles.performanceLabel
          }
        >
          PERFORMANCE HIGHLIGHTS
        </div>

        <h2
          className={
            styles.performanceTitle
          }
        >
          注目パフォーマンス
        </h2>

        <p
          className={
            styles.performanceDescription
          }
        >
          このPC構成の性能ポイントを
          わかりやすく整理しています。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.performanceGrid
        }
      >

        {highlights.map(
          (item) => (

            <div
              key={
                item.label
              }

              className={
                styles.performanceCard
              }
            >

              <div
                className={
                  styles.performanceCardTop
                }
              >

                <div
                  className={
                    styles.performanceCardLabel
                  }
                >
                  {item.label}
                </div>

                <div
                  className={
                    styles.performanceCardValue
                  }
                >
                  {item.value}
                </div>

              </div>

              <p
                className={
                  styles.performanceCardDescription
                }
              >
                {item.description}
              </p>

            </div>

          )
        )}

      </div>

    </section>

  )
}