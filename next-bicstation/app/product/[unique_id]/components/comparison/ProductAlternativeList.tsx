// next-bicstation/app/product/[unique_id]/components/comparison/ProductAlternativeList.tsx

import Link
  from 'next/link'

import styles
  from './comparison.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildAlternatives(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const alternatives = []

  /* ======================================
  💰 cost performance
  ====================================== */

  alternatives.push({
    icon: '💰',
    title: 'コスパ重視モデル',
    description:
      '価格を抑えながら gaming や日常用途を快適化したい人向け。',
    href:
      '/ranking/cost-performance',
  })

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
  ) {

    alternatives.push({
      icon: '🎮',
      title: 'FPS重視モデル',
      description:
        'より高fps gaming を重視したい人向けの構成です。',
      href:
        '/ranking/usage-gaming',
    })

  }

  /* ======================================
  🤖 AI
  ====================================== */

  if (
    text.includes('ai')
    || text.includes('rtx')
  ) {

    alternatives.push({
      icon: '🤖',
      title: 'AI向けモデル',
      description:
        'AI画像生成・生成AI用途をさらに重視したい人向け。',
      href:
        '/ranking/usage-ai',
    })

  }

  /* ======================================
  🎬 creator
  ====================================== */

  alternatives.push({
    icon: '🎬',
    title: '動画編集向けモデル',
    description:
      'Premiere Proや動画編集をさらに重視したい人向け。',
    href:
      '/ranking/usage-creator',
  })

  return alternatives.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductAlternativeList({
  product,
}: Props) {

  const alternatives =
    buildAlternatives(
      product
    )

  if (
    !alternatives.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.alternativeSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.alternativeHeader
        }
      >

        <div
          className={
            styles.alternativeLabel
          }
        >
          ALTERNATIVE OPTIONS
        </div>

        <h2
          className={
            styles.alternativeTitle
          }
        >
          他の比較候補も見る
        </h2>

        <p
          className={
            styles.alternativeDescription
          }
        >
          用途や重視ポイントによって、
          他のおすすめ構成も比較できます。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.alternativeGrid
        }
      >

        {alternatives.map(
          (item) => (

            <Link
              key={
                item.title
              }

              href={
                item.href
              }

              className={
                styles.alternativeCard
              }
            >

              {/* ==========================
              ICON
              ========================== */}

              <div
                className={
                  styles.alternativeIcon
                }
              >
                {item.icon}
              </div>

              {/* ==========================
              CONTENT
              ========================== */}

              <div
                className={
                  styles.alternativeContent
                }
              >

                <div
                  className={
                    styles.alternativeCardTitle
                  }
                >
                  {item.title}
                </div>

                <p
                  className={
                    styles.alternativeCardDescription
                  }
                >
                  {item.description}
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
          styles.alternativeFooter
        }
      >

        <div
          className={
            styles.alternativeFooterText
          }
        >
          ✔ 「今見ているPC」だけではなく、
          他の方向性も比較できます。
        </div>

      </div>

    </section>

  )
}