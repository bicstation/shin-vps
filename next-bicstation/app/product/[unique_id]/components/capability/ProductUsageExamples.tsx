// next-bicstation/app/product/[unique_id]/components/capability/ProductUsageExamples.tsx

import styles
  from './capability.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildUsageExamples(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const examples = []

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
    || text.includes('geforce')
  ) {

    examples.push({
      icon: '🎮',
      title: 'FPSゲーム',
      description:
        'APEX・VALORANT・Fortniteなどを高fpsで快適にプレイしやすい構成です。',
    })

  }

  /* ======================================
  🤖 AI
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    examples.push({
      icon: '🤖',
      title: 'AI画像生成',
      description:
        'Stable DiffusionなどのAI生成用途にも対応しやすいGPU性能です。',
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

    examples.push({
      icon: '🎬',
      title: '動画編集',
      description:
        'Premiere ProやDaVinci Resolveなどの編集用途でも使いやすい性能です。',
    })

  }

  /* ======================================
  📺 streaming
  ====================================== */

  if (
    text.includes('32gb')
    || text.includes('64gb')
  ) {

    examples.push({
      icon: '📺',
      title: 'ゲーム配信',
      description:
        'ゲームをしながら配信・Discord・ブラウザを同時利用しやすい構成です。',
    })

  }

  /* ======================================
  💻 default
  ====================================== */

  if (
    examples.length === 0
  ) {

    examples.push({
      icon: '💻',
      title: '日常用途',
      description:
        '動画視聴・ブラウジング・レポート作成などを快適に行いやすい構成です。',
    })

    examples.push({
      icon: '⚡',
      title: '快適動作',
      description:
        '一般用途から軽いクリエイティブ作業まで幅広く対応できます。',
    })

  }

  return examples.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductUsageExamples({
  product,
}: Props) {

  const examples =
    buildUsageExamples(
      product
    )

  if (
    !examples.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.usageSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.usageHeader
        }
      >

        <div
          className={
            styles.usageLabel
          }
        >
          REAL WORLD USAGE
        </div>

        <h2
          className={
            styles.usageTitle
          }
        >
          実際の利用シーン
        </h2>

        <p
          className={
            styles.usageDescription
          }
        >
          スペックではなく、
          実際にどんな用途で活躍しやすいかを
          わかりやすく整理しています。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.usageGrid
        }
      >

        {examples.map(
          (example) => (

            <div
              key={
                example.title
              }

              className={
                styles.usageCard
              }
            >

              {/* ==========================
              ICON
              ========================== */}

              <div
                className={
                  styles.usageIcon
                }
              >
                {example.icon}
              </div>

              {/* ==========================
              CONTENT
              ========================== */}

              <div
                className={
                  styles.usageContent
                }
              >

                <div
                  className={
                    styles.usageCardTitle
                  }
                >
                  {example.title}
                </div>

                <p
                  className={
                    styles.usageCardDescription
                  }
                >
                  {example.description}
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
          styles.usageFooter
        }
      >

        <div
          className={
            styles.usageFooterText
          }
        >
          ✔ gaming・AI・クリエイティブ用途など、
          幅広いシーンに対応しやすい構成です。
        </div>

      </div>

    </section>

  )
}