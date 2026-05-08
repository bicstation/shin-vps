// next-bicstation/app/product/[unique_id]/components/recommendation/ProductSimilarUsage.tsx

import Link
  from 'next/link'

import styles
  from './recommendation.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildSimilarUsage(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const usages = []

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
  ) {

    usages.push({
      icon: '🎮',
      title: 'FPS gaming 向け',
      description:
        '高fps gaming を重視した人気構成を比較できます。',
      href:
        '/ranking/usage-gaming',
    })

  }

  /* ======================================
  🤖 AI
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    usages.push({
      icon: '🤖',
      title: 'AI画像生成向け',
      description:
        'Stable DiffusionなどAI生成向けのおすすめ構成を比較できます。',
      href:
        '/ranking/usage-ai',
    })

  }

  /* ======================================
  🎬 creator
  ====================================== */

  usages.push({
    icon: '🎬',
    title: '動画編集向け',
    description:
      'Premiere ProやDaVinci Resolve向け構成を比較できます。',
    href:
      '/ranking/usage-creator',
  })

  /* ======================================
  💰 cost
  ====================================== */

  usages.push({
    icon: '💰',
    title: 'コスパ重視',
    description:
      '価格と性能バランスを重視した人気構成を比較できます。',
    href:
      '/ranking/cost-performance',
  })

  return usages.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductSimilarUsage({
  product,
}: Props) {

  const usages =
    buildSimilarUsage(
      product
    )

  if (
    !usages.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.similarUsageSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.similarUsageHeader
        }
      >

        <div
          className={
            styles.similarUsageLabel
          }
        >
          SIMILAR USAGE
        </div>

        <h2
          className={
            styles.similarUsageTitle
          }
        >
          似た用途の構成を比較する
        </h2>

        <p
          className={
            styles.similarUsageDescription
          }
        >
          同じ用途でも、
          他の方向性や性能バランスを
          比較できます。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.similarUsageGrid
        }
      >

        {usages.map(
          (usage) => (

            <Link
              key={
                usage.title
              }

              href={
                usage.href
              }

              className={
                styles.similarUsageCard
              }
            >

              {/* ==========================
              ICON
              ========================== */}

              <div
                className={
                  styles.similarUsageIcon
                }
              >
                {usage.icon}
              </div>

              {/* ==========================
              CONTENT
              ========================== */}

              <div
                className={
                  styles.similarUsageContent
                }
              >

                <div
                  className={
                    styles.similarUsageCardTitle
                  }
                >
                  {usage.title}
                </div>

                <p
                  className={
                    styles.similarUsageCardDescription
                  }
                >
                  {usage.description}
                </p>

              </div>

            </Link>

          )
        )}

      </div>

      {/* ==================================
      FOOTER
      ================================== */}

      <div
        className={
          styles.similarUsageFooter
        }
      >

        <div
          className={
            styles.similarUsageFooterText
          }
        >
          ✔ 同じ用途でも、
          性能バランスの違いを比較できます。
        </div>

      </div>

    </section>

  )
}