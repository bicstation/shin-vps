// next-bicstation/app/product/[unique_id]/components/trust/ProductTrustSection.tsx

import styles
  from './trust.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildTrustItems(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const items = []

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
    || text.includes('geforce')
  ) {

    items.push({
      icon: '🎮',
      title: 'ゲーム用途でも安心',
      description:
        'FPSゲームから重量級タイトルまで快適に遊びやすい性能です。',
    })

  }

  /* ======================================
  🤖 AI
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    items.push({
      icon: '🤖',
      title: 'AI用途にも対応',
      description:
        'AI画像生成やGPU活用アプリでも使いやすい構成です。',
    })

  }

  /* ======================================
  🧠 long term
  ====================================== */

  if (
    text.includes('32gb')
    || text.includes('64gb')
  ) {

    items.push({
      icon: '🧠',
      title: '長く使いやすい',
      description:
        '余裕ある性能構成で、数年単位でも快適に利用しやすいです。',
    })

  }

  /* ======================================
  ⚡ beginner
  ====================================== */

  items.push({
    icon: '⚡',
    title: '初心者にも人気',
    description:
      '性能バランスが良く、初めての高性能PCとしても選びやすい構成です。',
  })

  return items.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductTrustSection({
  product,
}: Props) {

  const trustItems =
    buildTrustItems(
      product
    )

  if (
    !trustItems.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.trustSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.trustHeader
        }
      >

        <div
          className={
            styles.trustLabel
          }
        >
          TRUST & CONFIDENCE
        </div>

        <h2
          className={
            styles.trustTitle
          }
        >
          安心して選びやすいポイント
        </h2>

        <p
          className={
            styles.trustDescription
          }
        >
          スペック比較だけではなく、
          実際の使いやすさや
          満足しやすい理由も整理しています。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.trustGrid
        }
      >

        {trustItems.map(
          (item) => (

            <div
              key={
                item.title
              }

              className={
                styles.trustCard
              }
            >

              {/* ==========================
              ICON
              ========================== */}

              <div
                className={
                  styles.trustIcon
                }
              >
                {item.icon}
              </div>

              {/* ==========================
              CONTENT
              ========================== */}

              <div
                className={
                  styles.trustContent
                }
              >

                <div
                  className={
                    styles.trustCardTitle
                  }
                >
                  {item.title}
                </div>

                <p
                  className={
                    styles.trustCardDescription
                  }
                >
                  {item.description}
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
          styles.trustFooter
        }
      >

        <div
          className={
            styles.trustFooterText
          }
        >
          ✔ 「性能が高い」だけではなく、
          実際に満足しやすい構成を重視しています。
        </div>

      </div>

    </section>

  )
}