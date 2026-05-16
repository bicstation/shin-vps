// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/ranking/SemanticInsightSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import SemanticInsightCard
  from '../../components/cards/SemanticInsightCard'

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

type InsightItem = {

  title?: string

  description?: string

  icon?: string
}

type Props = {

  insights?: InsightItem[]
}

/* =========================================
🔥 Section
========================================= */

export default function
SemanticInsightSection({

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

        gap: '28px',
      }}
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div>

        {/* ==============================
        LABEL
        ============================== */}

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
          semantic insight
        </div>

        {/* ==============================
        TITLE
        ============================== */}

        <SectionHeading>

          Semantic Insights

        </SectionHeading>

        {/* ==============================
        DESCRIPTION
        ============================== */}

        <SectionDescription>

          semantic ranking runtime
          から抽出された
          insight を表示しています。

          ranking の特徴や
          semantic density を
          human-readable に整理しています。

        </SectionDescription>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        style={{
          display: 'grid',

          gridTemplateColumns:
            'repeat(auto-fit,minmax(320px,1fr))',

          gap: '20px',
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
                  `${insight.title}-${index}`
                }

                insight={insight}

              />

            )

          }
        )}

      </div>

    </section>

  )
}