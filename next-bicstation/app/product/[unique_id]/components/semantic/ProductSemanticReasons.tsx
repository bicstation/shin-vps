// next-bicstation/app/product/[unique_id]/components/semantic/ProductSemanticReasons.tsx

import styles
  from './semantic.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildSemanticReasons(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const reasons = []

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
    || text.includes('geforce')
  ) {

    reasons.push({
      icon: '🎮',
      title: '高fps gaming に強い',
      description:
        'FPSゲームや重量級タイトルでも、快適なフレームレートを維持しやすいGPU性能を備えています。',
    })

  }

  /* ======================================
  🤖 AI
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    reasons.push({
      icon: '🤖',
      title: 'AI画像生成にも対応',
      description:
        'Stable DiffusionなどのGPU活用型AIワークロードでも使いやすい構成です。',
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

    reasons.push({
      icon: '🎬',
      title: '動画編集用途にも適応',
      description:
        'Premiere ProやDaVinci Resolveなど、クリエイティブ用途にも向いています。',
    })

  }

  /* ======================================
  🧠 multitask
  ====================================== */

  if (
    text.includes('32gb')
    || text.includes('64gb')
  ) {

    reasons.push({
      icon: '🧠',
      title: 'マルチタスク性能が高い',
      description:
        'ゲーム・配信・ブラウザなどを同時利用しやすい余裕ある構成です。',
    })

  }

  /* ======================================
  ⚡ default
  ====================================== */

  if (
    reasons.length === 0
  ) {

    reasons.push({
      icon: '⚡',
      title: '日常用途でも快適',
      description:
        'ブラウジング・動画視聴・一般作業まで、幅広く快適に使いやすい構成です。',
    })

  }

  return reasons.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductSemanticReasons({
  product,
}: Props) {

  const reasons =
    buildSemanticReasons(
      product
    )

  if (
    !reasons.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.semanticReasonsSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.semanticReasonsHeader
        }
      >

        <div
          className={
            styles.semanticReasonsLabel
          }
        >
          WHY THIS PC
        </div>

        <h2
          className={
            styles.semanticReasonsTitle
          }
        >
          おすすめされる理由
        </h2>

        <p
          className={
            styles.semanticReasonsDescription
          }
        >
          スペック数値だけではなく、
          実際の利用シーンをもとに
          このPCの強みを整理しています。
        </p>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        className={
          styles.semanticReasonsGrid
        }
      >

        {reasons.map(
          (reason) => (

            <div
              key={
                reason.title
              }

              className={
                styles.semanticReasonsCard
              }
            >

              {/* ==========================
              ICON
              ========================== */}

              <div
                className={
                  styles.semanticReasonsIcon
                }
              >
                {reason.icon}
              </div>

              {/* ==========================
              CONTENT
              ========================== */}

              <div
                className={
                  styles.semanticReasonsContent
                }
              >

                <div
                  className={
                    styles.semanticReasonsCardTitle
                  }
                >
                  {reason.title}
                </div>

                <p
                  className={
                    styles.semanticReasonsCardDescription
                  }
                >
                  {reason.description}
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
          styles.semanticReasonsFooter
        }
      >

        <div
          className={
            styles.semanticReasonsFooterText
          }
        >
          ✔ semantic analysis をもとに、
          実利用ベースで整理しています。
        </div>

      </div>

    </section>

  )
}