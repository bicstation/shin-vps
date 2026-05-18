// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/faq/ProductFaq.tsx
// ============================================================================

'use client'

import { useState }
  from 'react'

import styles
  from './faq.module.css'

type FAQItem = {

  question: string

  answer: string
}

type Props = {

  faqs?: FAQItem[]
}

/* ============================================================================
🔥 COMPONENT
============================================================================ */

export default function ProductFaq({
  faqs = [],
}: Props) {

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [
    openIndex,
    setOpenIndex,
  ] = useState<number | null>(
    0
  )

  // ==========================================================================
  // EMPTY
  // ==========================================================================

  if (
    !Array.isArray(faqs)
    || faqs.length === 0
  ) {

    return null

  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (

    <section
      className={
        styles.faqSection
      }
    >

      {/* ================================================================
      HEADER
      ================================================================ */}

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

          AI用途・ゲーム・動画編集など、
          実際の利用シーンで
          よくある質問を整理しています。

        </p>

      </div>

      {/* ================================================================
      FAQ LIST
      ================================================================ */}

      <div
        className={
          styles.faqList
        }
      >

        {
          faqs.map(
            (
              faq,
              index
            ) => {

              const isOpen =
                openIndex === index

              return (

                <div
                  key={index}

                  className={
                    styles.faqItem
                  }
                >

                  {/* ====================================================
                  QUESTION
                  ==================================================== */}

                  <button
                    type="button"

                    onClick={() => {

                      setOpenIndex(
                        isOpen
                          ? null
                          : index
                      )

                    }}

                    className={
                      styles.faqQuestion
                    }
                  >

                    <span>

                      {faq.question}

                    </span>

                    <span
                      className={
                        styles.faqIcon
                      }
                    >

                      {
                        isOpen
                          ? '−'
                          : '+'
                      }

                    </span>

                  </button>

                  {/* ====================================================
                  ANSWER
                  ==================================================== */}

                  {
                    isOpen && (

                      <div
                        className={
                          styles.faqAnswer
                        }
                      >

                        {faq.answer}

                      </div>

                    )
                  }

                </div>

              )

            }
          )
        }

      </div>

    </section>

  )
}