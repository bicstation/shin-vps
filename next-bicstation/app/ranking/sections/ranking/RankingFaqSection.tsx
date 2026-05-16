// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/ranking/RankingFaqSection.tsx
/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 UI
========================================= */

import SectionHeading
  from '../../components/ui/SectionHeading'

import SectionDescription
  from '../../components/ui/SectionDescription'

/* =========================================
🔥 Types
========================================= */

type FAQItem = {

  question: string

  answer: string
}

type Props = {

  items?: FAQItem[]
}

/* =========================================
🔥 Section
========================================= */

export default function
RankingFaqSection({

  items = [],

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !Array.isArray(items)
    || !items.length
  ) {
    return null
  }

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <section
      style={{
        display: 'grid',

        gap: '28px',
      }}
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div>

        <div
          style={{
            fontSize: '12px',

            fontWeight: 700,

            letterSpacing: '0.12em',

            textTransform:
              'uppercase',

            opacity: 0.45,

            marginBottom: '10px',
          }}
        >
          semantic faq
        </div>

        <SectionHeading>

          よくある質問

        </SectionHeading>

        <SectionDescription>

          semantic ranking runtime
          に関するFAQを表示しています。

        </SectionDescription>

      </div>

      {/* ==================================
      FAQ LIST
      ================================== */}

      <div
        style={{
          display: 'grid',

          gap: '18px',
        }}
      >

        {items.map(
          (
            item,
            index
          ) => {

            if (
              !item?.question
            ) {
              return null
            }

            return (

              <article
                key={
                  `${item.question}-${index}`
                }

                style={{
                  padding: '28px',

                  borderRadius: '28px',

                  background:
                    'rgba(255,255,255,0.04)',

                  border:
                    '1px solid rgba(255,255,255,0.08)',
                }}
              >

                {/* =========================
                QUESTION
                ========================= */}

                <h3
                  style={{
                    fontSize: '20px',

                    fontWeight: 800,

                    lineHeight: 1.5,

                    marginBottom: '18px',
                  }}
                >
                  {item.question}
                </h3>

                {/* =========================
                ANSWER
                ========================= */}

                <p
                  style={{
                    fontSize: '15px',

                    lineHeight: 1.9,

                    color:
                      'rgba(255,255,255,0.72)',
                  }}
                >
                  {item.answer}
                </p>

              </article>

            )

          }
        )}

      </div>

    </section>

  )
}