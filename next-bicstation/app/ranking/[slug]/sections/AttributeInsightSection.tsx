// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/sections/AttributeInsightSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import SemanticInsightCard
  from '../../components/cards/SemanticInsightCard'

import SectionHeading
  from '../../components/ui/SectionHeading'

/* =========================================
🔥 Types
========================================= */

type Props = {

  insights?: any[]
}

/* =========================================
🔥 Component
========================================= */

export default function
AttributeInsightSection({

  insights = [],

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !Array.isArray(insights)
    || !insights.length
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

        gap: '40px',
      }}
    >

      {/* ==================================
      HEADING
      ================================== */}

      <SectionHeading

        eyebrow="semantic insights"

        title="Runtime Semantic Insights"

        description={`
semantic runtime から導出された
attribute insight を表示しています。
`}

      />

      {/* ==================================
      GRID
      ================================== */}

      <div
        style={{
          display: 'grid',

          gridTemplateColumns:
            `
              repeat(
                auto-fit,
                minmax(320px,1fr)
              )
            `,

          gap: '24px',
        }}
      >

        {insights.map(
          (
            insight,
            index
          ) => {

            if (
              !insight?.title
            ) {
              return null
            }

            return (

              <SemanticInsightCard

                key={
                  insight.title
                  || index
                }

                insight={
                  insight
                }

              />

            )

          }
        )}

      </div>

    </section>

  )
}