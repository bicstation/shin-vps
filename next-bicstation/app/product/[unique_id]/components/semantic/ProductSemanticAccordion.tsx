// next-bicstation/app/product/[unique_id]/components/semantic/ProductSemanticAccordion.tsx

'use client'

import { useState }
  from 'react'

import styles
  from './semantic.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildSemanticItems(
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
      title: 'Gaming Performance',
      summary:
        '高fps gaming に対応しやすい構成です。',
      detail:
        'FPSゲームや重量級タイトルでも、高画質・高フレームレート環境を維持しやすいGPU性能を備えています。',
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
      title: 'AI Workload',
      summary:
        'AI画像生成用途にも対応しやすい構成です。',
      detail:
        'Stable Diffusionや画像生成AIなど、GPU活用型ワークロードでも快適に動作しやすい性能を備えています。',
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

    items.push({
      title: 'Creative Usage',
      summary:
        '動画編集や制作用途にも適しています。',
      detail:
        'Premiere ProやDaVinci Resolveなどの編集ソフトでも、快適に作業しやすい構成です。',
    })

  }

  /* ======================================
  🧠 multitask
  ====================================== */

  if (
    text.includes('32gb')
    || text.includes('64gb')
  ) {

    items.push({
      title: 'Multitasking',
      summary:
        '配信・ブラウザ・ゲーム同時利用にも強い構成です。',
      detail:
        '複数アプリを同時利用する環境でも、安定した動作を維持しやすい余裕があります。',
    })

  }

  /* ======================================
  💻 default
  ====================================== */

  if (
    items.length === 0
  ) {

    items.push({
      title: 'Daily Performance',
      summary:
        '日常用途を快適に行いやすい構成です。',
      detail:
        'ブラウジング・動画視聴・作業用途などを快適にこなしやすいバランス構成です。',
    })

  }

  return items.slice(0, 5)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductSemanticAccordion({
  product,
}: Props) {

  const items =
    buildSemanticItems(
      product
    )

  const [
    activeIndex,
    setActiveIndex,
  ] = useState<number | null>(
    0
  )

  if (
    !items.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.semanticAccordionSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.semanticAccordionHeader
        }
      >

        <div
          className={
            styles.semanticAccordionLabel
          }
        >
          SEMANTIC ANALYSIS
        </div>

        <h2
          className={
            styles.semanticAccordionTitle
          }
        >
          詳細パフォーマンス分析
        </h2>

        <p
          className={
            styles.semanticAccordionDescription
          }
        >
          スペックだけではなく、
          実際の利用シーンや
          強みを整理しています。
        </p>

      </div>

      {/* ==================================
      ACCORDION
      ================================== */}

      <div
        className={
          styles.semanticAccordionList
        }
      >

        {items.map(
          (
            item,
            index
          ) => {

            const isActive =
              activeIndex === index

            return (

              <div
                key={
                  item.title
                }

                className={
                  styles.semanticAccordionItem
                }
              >

                {/* ==========================
                BUTTON
                ========================== */}

                <button
                  type="button"

                  onClick={() => {

                    setActiveIndex(
                      isActive
                        ? null
                        : index
                    )

                  }}

                  className={
                    styles.semanticAccordionButton
                  }
                >

                  <div
                    className={
                      styles.semanticAccordionButtonContent
                    }
                  >

                    <div
                      className={
                        styles.semanticAccordionItemTitle
                      }
                    >
                      {item.title}
                    </div>

                    <div
                      className={
                        styles.semanticAccordionItemSummary
                      }
                    >
                      {item.summary}
                    </div>

                  </div>

                  <div
                    className={
                      styles.semanticAccordionIcon
                    }
                  >
                    {isActive
                      ? '−'
                      : '+'}
                  </div>

                </button>

                {/* ==========================
                CONTENT
                ========================== */}

                {isActive && (

                  <div
                    className={
                      styles.semanticAccordionContent
                    }
                  >

                    <p
                      className={
                        styles.semanticAccordionText
                      }
                    >
                      {item.detail}
                    </p>

                  </div>

                )}

              </div>

            )

          }
        )}

      </div>

      {/* ==================================
      FOOTER
      ================================== */}

      <div
        className={
          styles.semanticAccordionFooter
        }
      >

        <div
          className={
            styles.semanticAccordionFooterText
          }
        >
          ✔ semantic analysis をもとに、
          実利用ベースで整理しています。
        </div>

      </div>

    </section>

  )
}