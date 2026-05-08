// next-bicstation/app/product/[unique_id]/components/trust/ProductDecisionSupport.tsx

import styles
  from './trust.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildDecisionSupports(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const supports = []

  /* ======================================
  🎮 gaming confidence
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
    || text.includes('geforce')
  ) {

    supports.push({
      icon: '🎮',
      title: 'ゲーム用途でも安心',
      description:
        'FPSゲームから重量級タイトルまで、快適に遊びやすい構成です。',
    })

  }

  /* ======================================
  🤖 AI confidence
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    supports.push({
      icon: '🤖',
      title: 'AI用途にも対応',
      description:
        'Stable DiffusionなどのAI画像生成にも活用しやすいGPU性能です。',
    })

  }

  /* ======================================
  🧠 multitask
  ====================================== */

  if (
    text.includes('32gb')
    || text.includes('64gb')
  ) {

    supports.push({
      icon: '🧠',
      title: '長く使いやすい',
      description:
        'マルチタスク性能が高く、数年単位でも快適に使いやすい構成です。',
    })

  }

  /* ======================================
  ⚡ beginner
  ====================================== */

  supports.push({
    icon: '⚡',
    title: '初心者にも人気',
    description:
      '性能バランスが良く、初めての高性能PCとしても選びやすいモデルです。',
  })

  return supports.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductDecisionSupport({
  product,
}: Props) {

  const supports =
    buildDecisionSupports(
      product
    )

  if (
    !supports.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.decisionSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.decisionHeader
        }
      >

        <div
          className={
            styles.decisionLabel
          }
        >
          DECISION SUPPORT
        </div>

        <h2
          className={
            styles.decisionTitle
          }
        >
          安心して選びやすい理由
        </h2>

        <p
          className={
            styles.decisionDescription
          }
        >
          スペック比較だけではなく、
          実際の使いやすさや
          選ばれている理由を整理しています。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.decisionGrid
        }
      >

        {supports.map(
          (support) => (

            <div
              key={
                support.title
              }

              className={
                styles.decisionCard
              }
            >

              {/* ==========================
              ICON
              ========================== */}

              <div
                className={
                  styles.decisionIcon
                }
              >
                {support.icon}
              </div>

              {/* ==========================
              CONTENT
              ========================== */}

              <div
                className={
                  styles.decisionContent
                }
              >

                <div
                  className={
                    styles.decisionCardTitle
                  }
                >
                  {support.title}
                </div>

                <p
                  className={
                    styles.decisionCardDescription
                  }
                >
                  {support.description}
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
          styles.decisionFooter
        }
      >

        <div
          className={
            styles.decisionFooterText
          }
        >
          ✔ 「スペックが高い」だけではなく、
          実際に満足しやすいバランス構成を重視しています。
        </div>

      </div>

    </section>

  )
}