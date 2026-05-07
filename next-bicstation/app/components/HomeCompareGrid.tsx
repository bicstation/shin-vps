import ProductCard
  from '@/shared/components/organisms/cards/ProductCard'

import styles
  from '../page.module.css'

import {
  getSemanticDifference,
} from '../lib/homeHelpers'

type Props = {
  products: any[]
}

export default function HomeCompareGrid({
  products,
}: Props) {

  // --------------------------------
  // Empty
  // --------------------------------
  if (!products?.length) {
    return null
  }

  return (
    <section
      className={
        styles.compareSection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

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
          🔍 おすすめPC比較
        </div>

        <h2
          className={
            styles.compareTitle
          }
        >
          あなたに合うPCを比較
        </h2>

        <p
          className={
            styles.compareDescription
          }
        >
          ゲーム向け・動画編集向け・
          AI用途など、
          用途別におすすめPCを
          比較できます。
        </p>

      </div>

      {/* =====================================
      GRID
      ===================================== */}

      <div
        className={
          styles.compareGrid
        }
      >

        {products.map((
          product,
          index
        ) => {

          // --------------------------------
          // Semantic
          // --------------------------------
          const semantic =
            getSemanticDifference(
              product
            )

          // --------------------------------
          // Decision Chips
          // --------------------------------
          const decisionChips = []

          // usage
          if (
            semantic?.usage
          ) {

            if (
              semantic.usage.includes(
                'ゲーミング'
              )
            ) {
              decisionChips.push(
                '🎮 FPSゲーム向け'
              )
            }

            if (
              semantic.usage.includes(
                'クリエイター'
              )
            ) {
              decisionChips.push(
                '🎬 動画編集向け'
              )
            }

            if (
              semantic.usage.includes(
                'AI'
              )
            ) {
              decisionChips.push(
                '🤖 AI画像生成対応'
              )
            }

          }

          // GPU
          if (
            semantic?.gpu
          ) {

            if (
              semantic.gpu.includes(
                '4080'
              )
            ) {
              decisionChips.push(
                '🔥 高性能GPU'
              )
            }

            if (
              semantic.gpu.includes(
                '5070'
              )
            ) {
              decisionChips.push(
                '⚡ 最新GPU世代'
              )
            }

          }

          // fallback
          if (
            decisionChips.length === 0
          ) {

            decisionChips.push(
              '💻 高性能PC'
            )

          }

          return (
            <div
              key={
                product.unique_id
              }

              className={
                styles.compareItem
              }
            >

              {/* =================================
              META
              ================================= */}

              <div
                className={
                  styles.compareMeta
                }
              >

                {decisionChips.map((
                  chip,
                  chipIndex
                ) => (

                  <div
                    key={
                      chipIndex
                    }

                    className={
                      chipIndex === 0
                        ? styles.compareChipStrong
                        : styles.compareChip
                    }
                  >
                    {chip}
                  </div>

                ))}

              </div>

              {/* =================================
              PRODUCT CARD
              ================================= */}

              <ProductCard
                product={product}
                rank={index + 2}
              />

              {/* =================================
              REASON
              ================================= */}

              <div
                className={
                  styles.compareReason
                }
              >

                {semantic?.usage?.includes(
                  'ゲーミング'
                ) && (
                  <p>
                    FPSゲームや
                    高リフレッシュレート環境に
                    おすすめです。
                  </p>
                )}

                {semantic?.usage?.includes(
                  'クリエイター'
                ) && (
                  <p>
                    動画編集や
                    3DCG制作などの
                    高負荷作業にも対応。
                  </p>
                )}

                {semantic?.gpu?.includes(
                  '4080'
                ) && (
                  <p>
                    AI画像生成や
                    高画質ゲームにも
                    強いGPU構成です。
                  </p>
                )}

              </div>

            </div>
          )
        })}

      </div>

    </section>
  )
}