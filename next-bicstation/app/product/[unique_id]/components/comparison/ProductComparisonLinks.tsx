// next-bicstation/app/product/[unique_id]/components/comparison/ProductComparisonLinks.tsx

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

function buildComparisonLinks(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const links = []

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
  ) {

    links.push({
      icon: '🎮',
      title: 'FPS重視ランキング',
      description:
        '高fps gaming を重視したおすすめ構成を比較できます。',
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

    links.push({
      icon: '🤖',
      title: 'AI向けランキング',
      description:
        'AI画像生成・生成AI用途向けのおすすめ構成を比較できます。',
      href:
        '/ranking/usage-ai',
    })

  }

  /* ======================================
  🎬 creator
  ====================================== */

  links.push({
    icon: '🎬',
    title: '動画編集向けランキング',
    description:
      'Premiere Proや動画編集向けのおすすめ構成を比較できます。',
    href:
      '/ranking/usage-creator',
  })

  /* ======================================
  💰 cost
  ====================================== */

  links.push({
    icon: '💰',
    title: 'コスパ重視ランキング',
    description:
      '価格と性能バランスを重視した人気構成を比較できます。',
    href:
      '/ranking/cost-performance',
  })

  return links.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductComparisonLinks({
  product,
}: Props) {

  const links =
    buildComparisonLinks(
      product
    )

  if (
    !links.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.comparisonLinksSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.comparisonLinksHeader
        }
      >

        <div
          className={
            styles.comparisonLinksLabel
          }
        >
          CONTINUE COMPARISON
        </div>

        <h2
          className={
            styles.comparisonLinksTitle
          }
        >
          他の方向性も比較する
        </h2>

        <p
          className={
            styles.comparisonLinksDescription
          }
        >
          用途や重視ポイントを変えることで、
          自分に合う構成をさらに探しやすくなります。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.comparisonLinksGrid
        }
      >

        {links.map(
          (link) => (

            <Link
              key={
                link.title
              }

              href={
                link.href
              }

              className={
                styles.comparisonLinksCard
              }
            >

              {/* ==========================
              ICON
              ========================== */}

              <div
                className={
                  styles.comparisonLinksIcon
                }
              >
                {link.icon}
              </div>

              {/* ==========================
              CONTENT
              ========================== */}

              <div
                className={
                  styles.comparisonLinksContent
                }
              >

                <div
                  className={
                    styles.comparisonLinksCardTitle
                  }
                >
                  {link.title}
                </div>

                <p
                  className={
                    styles.comparisonLinksCardDescription
                  }
                >
                  {link.description}
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
          styles.comparisonLinksFooter
        }
      >

        <div
          className={
            styles.comparisonLinksFooterText
          }
        >
          ✔ 「この1台」で終わらず、
          他の方向性も比較しながら選べます。
        </div>

      </div>

    </section>

  )
}