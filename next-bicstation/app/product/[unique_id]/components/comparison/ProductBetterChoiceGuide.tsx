// next-bicstation/app/product/[unique_id]/components/comparison/ProductBetterChoiceGuide.tsx

import styles
  from './comparison.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildChoiceGuides(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const guides = []

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
  ) {

    guides.push({
      icon: '🎮',
      title: 'FPS重視なら',
      description:
        'より高fpsを求めるなら、上位GPUモデルも比較候補になります。',
    })

  }

  /* ======================================
  🤖 AI
  ====================================== */

  if (
    text.includes('ai')
    || text.includes('rtx')
  ) {

    guides.push({
      icon: '🤖',
      title: 'AI用途を重視するなら',
      description:
        'VRAM容量やGPU世代も比較すると、長期満足度が高くなります。',
    })

  }

  /* ======================================
  💰 cost
  ====================================== */

  guides.push({
    icon: '💰',
    title: 'コスパ重視なら',
    description:
      '用途に対して性能が高すぎないかも確認すると、価格効率を最適化しやすいです。',
  })

  /* ======================================
  🧠 long term
  ====================================== */

  guides.push({
    icon: '🧠',
    title: '長く使いたいなら',
    description:
      'メモリ容量や冷却性能も含めて比較すると、数年後の快適性に差が出やすいです。',
  })

  return guides.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductBetterChoiceGuide({
  product,
}: Props) {

  const guides =
    buildChoiceGuides(
      product
    )

  if (
    !guides.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.choiceGuideSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.choiceGuideHeader
        }
      >

        <div
          className={
            styles.choiceGuideLabel
          }
        >
          BETTER CHOICE GUIDE
        </div>

        <h2
          className={
            styles.choiceGuideTitle
          }
        >
          後悔しにくい選び方
        </h2>

        <p
          className={
            styles.choiceGuideDescription
          }
        >
          「性能が高いか」だけではなく、
          用途や予算とのバランスも
          比較しやすく整理しています。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.choiceGuideGrid
        }
      >

        {guides.map(
          (guide) => (

            <div
              key={
                guide.title
              }

              className={
                styles.choiceGuideCard
              }
            >

              {/* ==========================
              ICON
              ========================== */}

              <div
                className={
                  styles.choiceGuideIcon
                }
              >
                {guide.icon}
              </div>

              {/* ==========================
              CONTENT
              ========================== */}

              <div
                className={
                  styles.choiceGuideContent
                }
              >

                <div
                  className={
                    styles.choiceGuideCardTitle
                  }
                >
                  {guide.title}
                </div>

                <p
                  className={
                    styles.choiceGuideCardDescription
                  }
                >
                  {guide.description}
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
          styles.choiceGuideFooter
        }
      >

        <div
          className={
            styles.choiceGuideFooterText
          }
        >
          ✔ 「今だけ」ではなく、
          長期的な満足度も含めて比較できます。
        </div>

      </div>

    </section>

  )
}