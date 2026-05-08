// next-bicstation/app/product/[unique_id]/components/hero/ProductHeroCapability.tsx

import styles
  from './hero.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildCapabilities(
  product: any
) {

  const capabilities: string[] = []

  const text = JSON.stringify(
    product
  ).toLowerCase()

  // ======================================
  // GAMING
  // ======================================

  if (
    text.includes('rtx')
    || text.includes('geforce')
    || text.includes('gaming')
  ) {

    capabilities.push(
      '🎮 高fps gaming対応'
    )

    capabilities.push(
      '🎯 FPSゲームを快適プレイ'
    )

  }

  // ======================================
  // AI
  // ======================================

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    capabilities.push(
      '🤖 AI画像生成対応'
    )

    capabilities.push(
      '⚡ Stable Diffusion利用OK'
    )

  }

  // ======================================
  // CREATOR
  // ======================================

  if (
    text.includes('creator')
    || text.includes('premiere')
    || text.includes('davinci')
  ) {

    capabilities.push(
      '🎬 動画編集も快適'
    )

  }

  // ======================================
  // MEMORY
  // ======================================

  if (
    text.includes('32gb')
    || text.includes('64gb')
  ) {

    capabilities.push(
      '🧠 マルチタスクに強い'
    )

  }

  // ======================================
  // DEFAULT
  // ======================================

  if (
    capabilities.length === 0
  ) {

    capabilities.push(
      '💻 日常用途を快適化'
    )

    capabilities.push(
      '📺 動画視聴や作業向け'
    )

  }

  return capabilities.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductHeroCapability({
  product,
}: Props) {

  const capabilities =
    buildCapabilities(
      product
    )

  return (

    <section
      className={
        styles.heroCapabilitySection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.heroCapabilityHeader
        }
      >

        <div
          className={
            styles.heroCapabilityLabel
          }
        >
          REAL WORLD PERFORMANCE
        </div>

        <h2
          className={
            styles.heroCapabilityTitle
          }
        >
          このPCでできること
        </h2>

        <p
          className={
            styles.heroCapabilityDescription
          }
        >
          スペック情報だけではなく、
          実際の利用シーンをもとに
          おすすめ用途を整理しています。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.heroCapabilityGrid
        }
      >

        {capabilities.map(
          (capability) => (

            <div
              key={capability}

              className={
                styles.heroCapabilityCard
              }
            >

              <div
                className={
                  styles.heroCapabilityText
                }
              >
                {capability}
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
          styles.heroCapabilityFooter
        }
      >

        <div
          className={
            styles.heroCapabilityFooterText
          }
        >
          ✔ gaming・AI・クリエイティブ用途まで
          幅広く対応しやすい構成です。
        </div>

      </div>

    </section>

  )
}