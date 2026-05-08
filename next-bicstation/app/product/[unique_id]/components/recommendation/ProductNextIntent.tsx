// next-bicstation/app/product/[unique_id]/components/recommendation/ProductNextIntent.tsx

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

function buildNextIntents(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const intents = []

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
  ) {

    intents.push({
      icon: '🎮',
      title: 'FPS重視で探したい',
      description:
        '高fps gaming をさらに重視した構成を比較できます。',
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

    intents.push({
      icon: '🤖',
      title: 'AI用途を重視したい',
      description:
        'Stable DiffusionなどのAI生成向け構成を比較できます。',
      href:
        '/ranking/usage-ai',
    })

  }

  /* ======================================
  🎬 creator
  ====================================== */

  intents.push({
    icon: '🎬',
    title: '動画編集も重視したい',
    description:
      'Premiere Proや動画編集向け構成を比較できます。',
    href:
      '/ranking/usage-creator',
  })

  /* ======================================
  💰 cost
  ====================================== */

  intents.push({
    icon: '💰',
    title: 'コスパ重視で探したい',
    description:
      '価格と性能バランスを重視した人気構成を比較できます。',
    href:
      '/ranking/cost-performance',
  })

  return intents.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductNextIntent({
  product,
}: Props) {

  const intents =
    buildNextIntents(
      product
    )

  if (
    !intents.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.nextIntentSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.nextIntentHeader
        }
      >

        <div
          className={
            styles.nextIntentLabel
          }
        >
          NEXT COMPARISON
        </div>

        <h2
          className={
            styles.nextIntentTitle
          }
        >
          次に比較したい方向性
        </h2>

        <p
          className={
            styles.nextIntentDescription
          }
        >
          「このPCだけ」で終わらず、
          他の用途や重視ポイントも
          比較できます。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.nextIntentGrid
        }
      >

        {intents.map(
          (intent) => (

            <Link
              key={
                intent.title
              }

              href={
                intent.href
              }

              className={
                styles.nextIntentCard
              }
            >

              {/* ==========================
              ICON
              ========================== */}

              <div
                className={
                  styles.nextIntentIcon
                }
              >
                {intent.icon}
              </div>

              {/* ==========================
              CONTENT
              ========================== */}

              <div
                className={
                  styles.nextIntentContent
                }
              >

                <div
                  className={
                    styles.nextIntentCardTitle
                  }
                >
                  {intent.title}
                </div>

                <p
                  className={
                    styles.nextIntentCardDescription
                  }
                >
                  {intent.description}
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
          styles.nextIntentFooter
        }
      >

        <div
          className={
            styles.nextIntentFooterText
          }
        >
          ✔ comparison continuation により、
          自分に合う構成をさらに探しやすくしています。
        </div>

      </div>

    </section>

  )
}