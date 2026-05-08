// next-bicstation/app/product/[unique_id]/components/faq/ProductFaq.tsx

'use client'

import { useState }
  from 'react'

import styles
  from './faq.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildFaqs(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const faqs = []

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
  ) {

    faqs.push({
      question:
        'FPSゲームは快適にプレイできますか？',
      answer:
        '高fps gaming を意識した構成で、重量級タイトルでも快適に動作しやすい性能です。',
    })

  }

  /* ======================================
  🤖 AI
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    faqs.push({
      question:
        'AI画像生成にも使えますか？',
      answer:
        'Stable DiffusionなどGPU活用型AI用途にも対応しやすい構成です。',
    })

  }

  /* ======================================
  🎬 creator
  ====================================== */

  faqs.push({
    question:
      '動画編集用途にも向いていますか？',
    answer:
      'Premiere ProやDaVinci Resolveなど、クリエイティブ用途でも快適に使いやすい性能です。',
  })

  /* ======================================
  🧠 long term
  ====================================== */

  faqs.push({
    question:
      '長く使いやすい構成ですか？',
    answer:
      'メモリ容量やGPU性能に余裕があり、数年単位でも快適に使いやすい構成です。',
  })

  /* ======================================
  ⚡ beginner
  ====================================== */

  faqs.push({
    question:
      '初心者にもおすすめできますか？',
    answer:
      '用途バランスが良く、初めて高性能PCを選ぶ人にも扱いやすい構成です。',
  })

  return faqs.slice(0, 5)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductFaq({
  product,
}: Props) {

  const faqs =
    buildFaqs(
      product
    )

  const [
    activeIndex,
    setActiveIndex,
  ] = useState<number | null>(
    0
  )

  if (
    !faqs.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.faqSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.faqHeader
        }
      >

        <div
          className={
            styles.faqLabel
          }
        >
          FAQ
        </div>

        <h2
          className={
            styles.faqTitle
          }
        >
          よくある質問
        </h2>

        <p
          className={
            styles.faqDescription
          }
        >
          gaming・AI・creator用途など、
          実際に気になりやすいポイントを
          整理しています。
        </p>

      </div>

      {/* ==================================
      FAQ LIST
      ================================== */}

      <div
        className={
          styles.faqList
        }
      >

        {faqs.map(
          (
            faq,
            index
          ) => {

            const isActive =
              activeIndex === index

            return (

              <div
                key={
                  faq.question
                }

                className={
                  styles.faqItem
                }
              >

                {/* ==========================
                BUTTON
                ========================== */}

                <button
                  type="button"

                  className={
                    styles.faqButton
                  }

                  onClick={() => {

                    setActiveIndex(
                      isActive
                        ? null
                        : index
                    )

                  }}
                >

                  <div
                    className={
                      styles.faqQuestion
                    }
                  >
                    {faq.question}
                  </div>

                  <div
                    className={
                      styles.faqIcon
                    }
                  >
                    {isActive
                      ? '−'
                      : '+'}
                  </div>

                </button>

                {/* ==========================
                ANSWER
                ========================== */}

                {isActive && (

                  <div
                    className={
                      styles.faqAnswerWrap
                    }
                  >

                    <p
                      className={
                        styles.faqAnswer
                      }
                    >
                      {faq.answer}
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
          styles.faqFooter
        }
      >

        <div
          className={
            styles.faqFooterText
          }
        >
          ✔ semantic recommendation をもとに、
          実利用ベースで整理しています。
        </div>

      </div>

    </section>

  )
}