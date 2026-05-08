// /app/ranking/[type]/components/RankingQuickCompare.tsx

import styles
  from '../page.module.css'

type Props = {
  products: any[]
}

export default function RankingQuickCompare({
  products,
}: Props) {

  // =====================================
  // Top Products
  // =====================================

  const topProducts =
    products.slice(0, 4)

  // =====================================
  // Helper
  // =====================================

  function detectGpu(
    text?: string
  ) {

    if (!text) {
      return 'RTX'
    }

    if (text.includes('4090')) {
      return 'RTX4090'
    }

    if (text.includes('4080')) {
      return 'RTX4080'
    }

    if (text.includes('4070')) {
      return 'RTX4070'
    }

    if (text.includes('4060')) {
      return 'RTX4060'
    }

    return 'RTX'
  }

  function detectAiLevel(
    text?: string
  ) {

    if (!text) {
      return '○'
    }

    if (
      text.includes('4090')
      || text.includes('4080')
    ) {
      return '◎'
    }

    if (
      text.includes('4070')
    ) {
      return '○'
    }

    return '△'
  }

  function detectFps(
    text?: string
  ) {

    if (!text) {
      return '144fps'
    }

    if (
      text.includes('4090')
    ) {
      return '240fps'
    }

    if (
      text.includes('4080')
    ) {
      return '144fps'
    }

    return '60fps'
  }

  return (

    <section
      className={
        styles.compareSection
      }
    >

      {/* =================================
      HEADER
      ================================= */}

      <div
        className={
          styles.compareHeader
        }
      >

        <div
          className={
            styles.compareLabel
          }
        >
          QUICK COMPARE
        </div>

        <h2
          className={
            styles.compareTitle
          }
        >
          違いをすばやく比較
        </h2>

        <p
          className={
            styles.compareDescription
          }
        >
          FPS・AI性能・動画編集など、
          用途ごとの違いを
          一目で比較できます。
        </p>

      </div>

      {/* =================================
      GRID
      ================================= */}

      <div
        className={
          styles.compareGrid
        }
      >

        {topProducts.map((

          product,
          index

        ) => {

          const fullText =
            JSON.stringify(
              product
            )

          const gpu =
            detectGpu(
              fullText
            )

          const ai =
            detectAiLevel(
              fullText
            )

          const fps =
            detectFps(
              fullText
            )

          return (

            <div
              key={index}

              className={
                styles.compareCard
              }
            >

              {/* =========================
              TOP
              ========================= */}

              <div
                className={
                  styles.compareTop
                }
              >

                <div
                  className={
                    styles.compareRank
                  }
                >
                  #{index + 1}
                </div>

                <div
                  className={
                    styles.compareGpu
                  }
                >
                  {gpu}
                </div>

              </div>

              {/* =========================
              NAME
              ========================= */}

              <div
                className={
                  styles.compareName
                }
              >
                {product?.name}
              </div>

              {/* =========================
              DIFFERENCE BLOCKS
              ========================= */}

              <div
                className={
                  styles.compareSpecs
                }
              >

                {/* =======================
                AI
                ======================= */}

                <div
                  className={
                    styles.compareSpec
                  }
                >

                  <div
                    className={
                      styles.compareSpecLabel
                    }
                  >
                    AI対応
                  </div>

                  <div
                    className={
                      styles.compareSpecValue
                    }
                  >
                    {ai}
                  </div>

                </div>

                {/* =======================
                FPS
                ======================= */}

                <div
                  className={
                    styles.compareSpec
                  }
                >

                  <div
                    className={
                      styles.compareSpecLabel
                    }
                  >
                    FPS
                  </div>

                  <div
                    className={
                      styles.compareSpecValue
                    }
                  >
                    {fps}
                  </div>

                </div>

                {/* =======================
                EDIT
                ======================= */}

                <div
                  className={
                    styles.compareSpec
                  }
                >

                  <div
                    className={
                      styles.compareSpecLabel
                    }
                  >
                    編集
                  </div>

                  <div
                    className={
                      styles.compareSpecValue
                    }
                  >
                    4K対応
                  </div>

                </div>

              </div>

            </div>

          )

        })}

      </div>

    </section>

  )
}