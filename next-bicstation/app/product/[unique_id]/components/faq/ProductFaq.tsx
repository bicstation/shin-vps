// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/faq/ProductFaq.tsx
// ============================================================================

'use client'

import {

  useState,

} from 'react'

import styles
  from './faq.module.css'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,

} from '@/shared/lib/api/django/pc/product-detail'

/* ============================================================================
🔥 Types
============================================================================ */

type FAQItem = {

  question: string

  answer: string

}

type Props = {

  product: ProjectedProduct

}

/* ============================================================================
🔥 FAQ Builder
============================================================================ */

function buildFaqs(

  product: ProjectedProduct

): FAQItem[] {

  return [

    {

      question:
        'このPCはどんな用途に向いていますか？',

      answer:

        `${product.name} は用途に応じた構成を備えたモデルです。`

    },

    {

      question:
        'ゲーム用途にも使えますか？',

      answer:

        'GPU構成やCPU性能によって快適に利用できます。'

    },

    {

      question:
        '生成AIや動画編集にも対応できますか？',

      answer:

        '用途に応じてAI・動画編集・クリエイティブ用途にも利用できます。'

    },

  ]

}

/* ============================================================================
🔥 COMPONENT
============================================================================ */

export default function ProductFaq({

  product,

}: Props) {

  const faqs =

    buildFaqs(

      product

    )

  const [

    openIndex,

    setOpenIndex,

  ] = useState<number | null>(0)

  if (

    faqs.length === 0

  ) {

    return null

  }

  return (

    <section
      className={
        styles.faqSection
      }
    >

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

                  <button

                    type="button"

                    onClick={() =>

                      setOpenIndex(

                        isOpen

                          ? null

                          : index

                      )

                    }

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