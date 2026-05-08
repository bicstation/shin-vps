// next-bicstation/app/product/[unique_id]/components/capability/ProductCapability.tsx

import styles
  from './capability.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildCapabilityCards(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const cards = []

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
    || text.includes('geforce')
  ) {

    cards.push({
      icon: '🎮',
      title: '高fps gaming',
      description:
        'FPS・オープンワールド系ゲームを高画質で快適にプレイしやすい構成です。',
    })

  }

  /* ======================================
  🤖 AI
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    cards.push({
      icon: '🤖',
      title: 'AI画像生成対応',
      description:
        'Stable DiffusionなどのAI生成用途にも対応しやすいGPU性能を備えています。',
    })

  }

  /* ======================================
  🎬 creator
  ====================================== */

  if (
    text.includes('creator')
    || text.includes('premiere')
    || text.includes('davinci')
  ) {

    cards.push({
      icon: '🎬',
      title: '動画編集も快適',
      description:
        'Premiere ProやDaVinci Resolveなどの編集用途にも適した性能です。',
    })

  }

  /* ======================================
  📺 streaming
  ====================================== */

  if (
    text.includes('32gb')
    || text.includes('64gb')
  ) {

    cards.push({
      icon: '📺',
      title: '配信しながらゲーム',
      description:
        'マルチタスク性能が高く、ゲーム配信や同時作業にも向いています。',
    })

  }

  /* ======================================
  💻 default
  ====================================== */

  if (
    cards.length === 0
  ) {

    cards.push({
      icon: '💻',
      title: '日常用途を快適化',
      description:
        '動画視聴・ブラウジング・作業用途を快適に行いやすい構成です。',
    })

    cards.push({
      icon: '⚡',
      title: 'サクサク動作',
      description:
        '一般用途から軽いクリエイティブ用途まで幅広く対応できます。',
    })

  }

  return cards.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductCapability({
  product,
}: Props) {

  const capabilityCards =
    buildCapabilityCards(
      product
    )

  return (

    <section
      className={
        styles.capabilitySection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.capabilityHeader
        }
      >

        <div
          className={
            styles.capabilityLabel
          }
        >
          REAL WORLD PERFORMANCE
        </div>

        <h2
          className={
            styles.capabilityTitle
          }
        >
          このPCでできること
        </h2>

        <p
          className={
            styles.capabilityDescription
          }
        >
          スペックだけではなく、
          実際の利用シーンから
          このPCの強みを整理しています。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.capabilityGrid
        }
      >

        {capabilityCards.map(
          (card) => (

            <div
              key={card.title}

              className={
                styles.capabilityCard
              }
            >

              <div
                className={
                  styles.capabilityIcon
                }
              >
                {card.icon}
              </div>

              <div
                className={
                  styles.capabilityContent
                }
              >

                <div
                  className={
                    styles.capabilityCardTitle
                  }
                >
                  {card.title}
                </div>

                <p
                  className={
                    styles.capabilityCardDescription
                  }
                >
                  {card.description}
                </p>

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
          styles.capabilityFooter
        }
      >

        <div
          className={
            styles.capabilityFooterText
          }
        >
          ✔ gaming・AI・クリエイティブ用途まで
          幅広く対応しやすいバランス構成です。
        </div>

      </div>

    </section>

  )
}